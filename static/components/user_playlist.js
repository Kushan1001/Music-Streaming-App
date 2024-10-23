export default{
    template:`
        <div>
            <div v-if="playlists.length == 0">
                <h1 style="text-align: center; margin-top: 2px; font-size:50px"> No playlists available</h1>  
            </div>

            <div v-else>
                <div>
                    <h1 style="text-align: center; margin-top: 2px; font-size:50px">Available Playlists</h1>
                </div>

                <div style="text-align:center; margin-top:100px; margin-right:50px">
                    <label style="margin-right:20px">Search Playlists:</label>
                    <input type="search" v-model="search_value">
                </div>

                <div style="display:flex; justify-content:center; margin-top:20px; margin-right:40px">
                    <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                        <tr>
                            <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Playlist Name</th>
                        </tr>

                        <tr v-for="(playlist, index) in filtered_playlists">
                            <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center; text-decoration:underline; cursor:pointer" @click="go_to_playlist_songs(playlist.playlist_id)">
                                {{playlist.playlist_name}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="add_to_playlist(playlist.playlist_id)">Add a song</button></td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="delete_playlist(playlist.playlist_id)">Delete</button></td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="text-align:center; margin-right:50px; margin-top:30px">
                <button @click="go_back">Go to user dashboard</button>
                <button @click="create_playlist">Create Playlist</button>
            </div>
        </div>
    `,

    data(){
        return{
            details:{
                user_id: localStorage.getItem('user_id')
            },
            playlists: [],
            search_value:"", 
            msg: ""
        }
    },

    methods:{
        async all_user_playlists(){
            const response = await fetch("/get_user_playlists",{
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json()

            if (response.ok){
                this.playlists = data.data
            }
            else{
                this.msg = data.message
            }
        },

        async delete_playlist(playlist_id){
            const response = await fetch("/delete_playlist", {
                method:"POST",
                headers: {
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({"playlist_id": playlist_id})
            })
            const data = await response.json()
            if (response.ok){
                console.log("success")
                location.reload()
            }
            else{
                console.log("failed")
                this.msg = data.message
            }
        },

        add_to_playlist(playlist_id){
            this.$router.push({path: "/add_to_playlist", query:{playlist_id:playlist_id} })
        },

        create_playlist(){
            this.$router.push("/create_playlist")
        },

        go_back(){
            this.$router.push("/user_dashboard")
        },

        go_to_playlist_songs(playlist_id){
            this.$router.push({path:"/songs_in_playlist", query:{playlist_id: playlist_id} })

        },

        clear_msg(){
            this.validation_msg = null
        }
    },

    computed:{
        filtered_playlists(){
            return this.playlists.filter(playlist => playlist.playlist_name.includes(this.search_value.toLowerCase()))
        }
    },

    mounted(){
        this.all_user_playlists()
    }
}