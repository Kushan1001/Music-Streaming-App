export default{
    template: `
    <div>
        <div v-if="genre.length == 0">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px"> No songs available</h1>  
        </div>
        
        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px">Genres</h1>
    
            <div style="text-align:center; margin-top:100px; margin-right:200px">
                <label style="margin-right:20px">Search Genre:</label>
                <input type="search" v-model="search_value">
            </div>

            <div style="display:flex; justify-content:center; margin-top:20px; margin-right:150px">
                <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                    <tr>
                        <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Album Name</th>
                    </tr>

                    <tr v-for="(genre, index) in filtered_genres">
                        <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center; text-decoration:underline; cursor: pointer" @click="genre_songs(genre.genre_name)">
                            {{genre.genre_name}}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div style="margin-top: 20px; text-align:center; margin-right:150px">
            <button @click="go_back">Go to user dashboard</button>
        </div>        
    </div>
    `,
    
    data(){
        return{
            genre:[],
            msg:[],
            search_value:""       
        }
    },

    methods:{
        async get_genres(){
            const response = await fetch("/user_genre")

            const data = await response.json() 

            if (response.ok){
                this.genre = data.data
            }
            else{
                this.msg = data.message
            }
        },
        
        genre_songs(genre_name){
            this.$router.push({path:"user_genre_songs", query:{genre_name:genre_name} })
        },

        go_back(){
            this.$router.push("/user_dashboard")
        }
    },

    computed:{
        filtered_genres(){
            return this.genre.filter(genre => genre.genre_name.includes(this.search_value.toLowerCase()))
        }
    },

    mounted(){
        this.get_genres()
    }
}