import { ApolloProvider } from '@apollo/client'
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { client } from './services/apollo-client'

import 'bootstrap/dist/css/bootstrap.min.css'

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
