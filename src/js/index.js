import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state
// - Search object
// - Current recipe object
// - shopping list object
// - liked recipes
const state = {};
/*
    search controller
*/
const controlSearch = async () => {
    // 1 - get query from the view
    const query = searchView.getInput();

    if (query) {
        // 2 - new search object and add to state
        state.search = new Search(query);

        // 3 - prepare ui for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4 - search for recipes
            await state.search.getResults();

            // 5 - render results on ui
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/*
    recipe controller
*/
const controlRecipe = async () => {
    // get id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // prepare ui for changes

        // create new recipe object
        state.recipe = new Recipe(id);

        try {
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            // render recipe
            console.log(state.recipe);
        } catch (err) {
            alert('Error processing recipe');
        }
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));