import { PageProps } from 'fresh'

console.log('testing')

export default function App({ Component, ...props }: PageProps) {
  return (
    <html className='antialiased bg-white scroll-smooth' lang='en'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='robots' content='noindex' />
        <title>Virtual Hospitals Africa</title>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        {
          /* <link
          rel='preconnect'
          href='https://cdn.fontshare.com'
          crossOrigin='anonymous'
        /> */
        }
        <link rel='stylesheet' href='/styles.css' />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Ubuntu:wght@300;400;500;600;700;800&family=Roboto&display=swap'
          media='print'
          // @ts-ignore - onload is valid on link elements
          onload="this.media='all'"
        />
        {
          /* <link
          rel='stylesheet'
          href='https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap'
          media='print'
          // @ts-ignore - onload is valid on link elements
          id="fonts-fontshare"
          onload="this.media='all'"
        /> */
        }
        {props.route === '/' && (
          <>
            <meta
              name='description'
              content='Bringing accessible health care to Africans'
            />
            <link rel='stylesheet' href='/mhi.css' />
            <meta property='og:type' content='website' />
            <meta property='og:title' content='Virtual Hospitals Africa' />
            <meta
              property='og:description'
              content='Bringing accessible health care to Africans'
            />
            <meta property='og:local' content='en_GB' />
            <meta
              property='og:image'
              content='https://virtualhospitalsafrica.org/images/ogimage.png'
            />

            <meta property='og:image:type' content='image/png' />
            <meta property='og:image:width' content='256' />
            <meta property='og:image:height' content='256' />

            <meta property='og:site_name' content='Virtual Hospitals Africa' />
            <meta
              property='og:url'
              content='https://virtualhospitalsafrica.org'
            />
            <link rel='manifest' href='manifest.json'></link>
            <link
              rel='apple-touch-icon'
              sizes='180x180'
              href='https://za.virtualhospitalsafrica.org/images/ogimage.png'
            />
            <script src='https://youtube.com/iframe_api' async />
          </>
        )}
        {props.route === '/tutorial' && (
          <>
            <meta
              name='description'
              content='Guided tour of a digital health platform connecting African health workers'
            />
            <meta property='og:type' content='website' />
            <meta
              property='og:title'
              content='Virtual Hospitals Africa Tutorial'
            />
            <meta
              property='og:description'
              content='Guided tour of a digital health platform connecting African health workers'
            />
            <meta property='og:local' content='en_GB' />
            <meta
              property='og:image'
              content='https://za.virtualhospitalsafrica.org/images/ogimage-tutorial.png'
            />

            <meta property='og:image:type' content='image/png' />
            <meta property='og:image:width' content='1200' />
            <meta property='og:image:height' content='630' />

            <meta
              property='og:site_name'
              content='Virtual Hospitals Africa Tutorial'
            />
            <meta
              property='og:url'
              content='https://za.virtualhospitalsafrica.org/tutorial'
            />
          </>
        )}
        {(props.route?.startsWith('/app') ||
          props.route?.startsWith('/regulator')) && <script src='/scripts/general.js' async />}
        {
          // Tutorial font loading, not sure if it's the "Fresh" way of conditionally importing a font
          props.route === '/tutorial' && <link rel='stylesheet' href='/tutorial.css' />
        }
      </head>
      <body className='relative flex flex-col justify-between min-h-screen'>
        <Component />
      </body>
    </html>
  )
}
