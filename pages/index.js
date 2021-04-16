import { useEffect, useState } from 'react'

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
function stringToHTML(str) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(str, 'text/html')
  // DOMParser automatically puts <script> tags inside
  // doc.head instead of doc.body
  return doc.head
}

export default function App() {
  const [value, setValue] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    if (value === '') {
      setResult('')
      return
    }

    if (
      !value.trim().startsWith('<script ') ||
      !value.trim().endsWith('</script>')
    ) {
      console.log(value)
      setResult('')
      return
    } else if (!value.includes('src=')) {
      console.log(value)
      setResult('')
      return
    }

    const script = stringToHTML(value).querySelector('script')

    let attributes = [...script.attributes].map((attr) => {
      let name = attr.name
      let value = attr.value

      if (attr.name.startsWith('data-')) {
        // get the parts after `data-`
        let datasetNameParts = name.split('-')
        datasetNameParts.shift()

        // camelCase the dataset attribute
        datasetNameParts = datasetNameParts.map((part, index) => {
          if (index > 0) {
            return part.charAt(0).toUpperCase() + part.slice(1)
          }
          return part;
        })

        name = `dataset.${datasetNameParts.join('')}`
      }

      return {
        name,
        value,
      }
    })

    if (!attributes.find((attr) => attr.type === 'async')) {
      attributes.push({
        name: 'async',
        value: 'true',
      })
    }

    attributes = attributes.filter((attr) => attr.name !== 'defer')

    let attributesStr = ''

    attributes.forEach((attr) => {
      if (attr.value === 'true' || attr.value === 'false') {
        attributesStr += `\n    script.${attr.name} = ${attr.value};`
      } else {
        attributesStr += `\n    script.${attr.name} = '${attr.value}';`
      }
    })

    let newResult = /* html */`
<script>
  ((w, d) => {
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'
    ];

    function handleUserActivity() {
      activityEvents.forEach(function(eventName) {
        d.removeEventListener(eventName, handleUserActivity, true);
      });

      const script = d.createElement('script');
      ${attributesStr}

      d.body.appendChild(script);
    }

    w.addEventListener('load', () => {
      activityEvents.forEach(function(eventName) {
        d.addEventListener(eventName, handleUserActivity, true);
      });
    });
  })(window, document);
</script>
    `

    setResult(newResult)
  }, [value])

  return (
    <div className="App">
      <p>
        <strong>
          Converts a script tag with a 'src' attribute to one that will load the
          script on first user activity.
        </strong>
      </p>
      <p>Example code:</p>
      <pre>
        {`<script type="text/javascript" src="https://some-external-site.com/widget/12345.js" defer></script>`}
      </pre>
      <p>
        Enter a <code>{'<script>'}</code> tag:
      </p>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} />
      <p>Result:</p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
    </div>
  )
}
