import {
  ApolloClient,
  InMemoryCache
} from '@apollo/client'
import { SERVER_URL } from '../shared/constants'

export const client = new ApolloClient({
  uri: SERVER_URL,
  cache: new InMemoryCache({
    typePolicies: {
      RecipeDTO: {
        fields: {
          ingredients: {
            merge(existing, incoming) {
              // Equivalent to what happens if there is no custom merge function.
              return incoming
            }
          },
          steps: {
            merge(existing, incoming) {
              // Equivalent to what happens if there is no custom merge function.
              return incoming
            }
          }
        }
      }
    }
  })
})
