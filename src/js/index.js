import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';

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

    if (id) {
        // prepare ui for changes
        renderLoader(elements.recipe);

        //highlight selected search item

        if(state.search) searchView.highlightSelected(id);
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
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
            
        } catch (err) {
            alert('Error processing recipe');
        }
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
LIST CONTROLLER
*/

const controlList = () => {
    // create a new list if there is none yet
    if(!state.list) state.list = new List();

    // add each ingredient to the list 
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete event on button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state and user interface
        state.list.deleteItem(id);

        //delete item from ui
        listView.deleteItem(id);

        //handle count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/*
LIKE CONTROLLER
*/

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;
    //user has not yet liked current recipe
    if(!state.likes.isLiked(currentId)) {
        //add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
        );
        //toggle the like button
        likesView.toggleLikeBtn(true);
        //add like to ui list
        likesView.renderLike(newLike);
        
    //user has liked current recipe
    } else {
        //remove like from the state
        state.likes.deleteLike(currentId);
        //toggle the like button
        likesView.toggleLikeBtn(false);
        //remove like from ui list
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    //restore likes
    state.likes.readStorage();
    // toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    //render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // like controller
        controlLike();
    }
});

