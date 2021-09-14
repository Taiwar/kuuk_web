import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import { Nav } from './components/nav';
import { CreateRecipe } from './views/createRecipe';
import { Home } from './views/home';
import { RecipePage } from './views/recipe';
import { Search } from './views/search';
import { ImportRecipe } from './views/importRecipe';

function App(): JSX.Element {
  return (
    <Router>
      <div className="h-full min-h-screen flex bg-gray-100">
        <Nav />
        <main className="w-full">
          <Switch>
            <Route path="/recipe/:slug">
              <RecipePage />
            </Route>
            <Route path="/createRecipe">
              <CreateRecipe />
            </Route>
            <Route path="/importRecipe">
              <ImportRecipe />
            </Route>
            <Route path="/search">
              <Search />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
