export default{
    template: `
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Flagged Songs</h1>

            <div v-if="flagged_songs.length == 0">
                <h1 style="text-align: center; margin-top: 150px; font-size:50px">No Songs are flagged</h1>
            </div>  

            <div v-else>
                <div style="text-align:center; margin-top: 80px;">
                    <div v-if="msg">
                        <span>{{ msg }}</span>
                        <button @click="clear_msg" style="margin-left:5px">Close</button>
                    </div>
                </div>

                <div style="text-align:center; margin-top:20px; margin-right:50px">
                    <label style="margin-right:20px">Search Song:</label>
                    <input type="search" v-model="search_value">
                </div>

                <div style="display:flex; justify-content:center; margin-top:30px; margin-left:5px">
                    <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                        <tr>
                            <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Song Name</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Album</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Artist</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Flagged By</th>
                        </tr>

                        <tr v-for="(song, index) in filtered_songs">
                            <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_name}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.album}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.f_name}} {{song.l_name}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.flagged}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="delete_song(song.song_id)">Delete</button></td>  
                        </tr>
                    </table>
                </div>
            </div>
            <div style="text-align:center; margin-top:50px">
                <button @click="go_back">Go to admin dashboard</button>
            </div>
        </div>

    `,

    data(){
        return{
            flagged_songs:[],
            msg: "",
            search_value: ""
        }
    },

    methods:{
        async get_flagged_songs(){
            const response = await fetch("/get_flagged_songs")
            const data = await response.json()

            if (response.ok){
                this.flagged_songs = data.data
                console.log(this.flagged_songs)
            }
        },
        clear_msg(){
            this.msg = null
        },

        async delete_song(song_id){
            const response = await fetch("/delete_song_by_admin", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"song_id": song_id})
            })

            const data = await response.json()
            
            if (response.ok){
                location.reload()
            }
            else{
                this.msg = data.message
            }
        },

        go_back(){
            this.$router.push("/admin_dashboard")
        }
    },

    computed:{
        filtered_songs(){
            return this.flagged_songs.filter(song => song.song_name.includes(this.search_value.toLowerCase()))
        },
    },
    
    mounted(){
        this.get_flagged_songs()
    }
    
}