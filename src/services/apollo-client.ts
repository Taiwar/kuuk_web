import {
  ApolloClient,
  InMemoryCache
} from '@apollo/client'
import { SERVER_URL } from '../shared/constants'

export const client = new ApolloClient({
  uri: SERVER_URL,
  cache: new InMemoryCache()
})
