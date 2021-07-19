import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import './App.css'
import { Header } from './components/header'
import { CreateRecipe } from './views/createRecipe'
import { Home } from './views/home'
import { RecipePage } from './views/recipe'

function App() {
  return (
    <Router>
      <div className="h-full w-screen min-h-screen flex bg-gray-100">
        <Header />
        <main className="p-b p-4">
          <Switch>
            <Route path="/recipe/:slug">
              <RecipePage />
            </Route>
            <Route path="/createRecipe">
              <CreateRecipe />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  )
}

export default App
