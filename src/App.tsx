import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import './App.css'
import { Header } from './components/header'
import { Home } from './views/home'
import { RecipePage } from './views/recipe'

function App() {
  return (
    <Router>
      <Header />

      <main className="p-b p-4">
        <Switch>
          <Route path="/recipe/:slug">
            <RecipePage />
          </Route>
          <Route path="/createRecipe">
            <p>Create</p>
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </main>
    </Router>
  )
}

export default App
