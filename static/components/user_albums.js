export default{
    template: `
    <div>
        <div v-if="albums.length == 0">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px"> No albums available</h1>  
        </div>
        
        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px">Albums Available</h1>
    

            <div style="text-align:center; margin-top:100px; margin-right:200px">
                <label style="margin-right:20px">Search Album:</label>
                <input type="search" v-model="search_value">
            </div>

            <div style="display:flex; justify-content:center; margin-top:20px; margin-right:150px">
                <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                    <tr>
                        <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Album Name</th>
                    </tr>

                    <tr v-for="(album, index) in filtered_albums.slice().reverse()">
                        <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center; text-decoration:underline; cursor: pointer" @click="album_songs(album.album_id)">
                            {{album.album_name}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{album.f_name}} {{album.l_name}}</td>
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
            albums:[],
            msg:[],
            search_value:""       
        }
    },

    methods:{
        async get_albums(){
            const response = await fetch("/user_albums")

            const data = await response.json() 

            if (response.ok){
                this.albums = data.data
            }
            else{
                this.msg = data.message
            }
        },

        go_back(){
            this.$router.push("/user_dashboard")
        },

        album_songs(album_id){
            this.$router.push({path: "/user_album_songs", query:{album_id:album_id} })
        }
    },

    computed:{
        filtered_albums(){
            return this.albums.filter(album => album.album_name.includes(this.search_value.toLowerCase()))
        }
    },

    mounted(){
        this.get_albums()
    }
}