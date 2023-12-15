import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.html(
    <html>
        <body>
            <h1>Hello World</h1>
        </body>
    </html>)
)

export default app
