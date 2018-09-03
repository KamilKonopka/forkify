import axios from 'axios';

export default class Search {
    constructor (query) {
        this.query = query;
    }

    async getResults() {
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        const key = '1e7e93f20a9f3e09ab4c0f4d5187bf13';
        try {
            const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            //  console.log(this.result);
        } catch (error) {
            alert(error);
        }
    }
}


