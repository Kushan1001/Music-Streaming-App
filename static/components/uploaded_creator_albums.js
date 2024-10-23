export default{
    template: `
    <div>
        <div v-if="albums.length == 0">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px"> No albums uploaded by the creator</h1>  
        </div>
        
        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px">Albums Uploaded</h1>

            <div style="text-align:center; margin-top: 80px; margin-right:100px">
                <div v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                    <span style="font-weight: bold">{{ msg }}</span>
                    <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
                </div>
            </div>

            <div style="text-align:center; margin-top:30px; margin-right:200px">
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
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="edit_album(album.album_id)">Edit</button></td>
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="delete_album(album.album_id)">Delete</button></td>
                    </tr>
                </table>
            </div>
        </div>

        <div style="margin-top: 20px; text-align:center; margin-right:150px">
            <button @click="go_back">Go to creator dashboard</button>
        </div>        
    </div>
    `,
    
    data(){
        return{
            details:{
                user_id:localStorage.getItem('user_id')
            },
            albums:[],
            msg: this.$route.query['msg'],
            search_value:""       
        }
    },

    methods:{
        async get_albums(){
            const response = await fetch("/creator_albums", {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json() 

            if (response.ok){
                this.albums = data.data
            }
            else{
                this.msg = data.message
            }
        },

        go_back(){
            this.$router.push("/creator_dashboard")
        },

        album_songs(album_id){
            this.$router.push({path: "/creator_album_songs", query:{album_id:album_id} })
        },

        edit_album(album_id){
            this.$router.push({path: "/edit_album_details", query:{album_id:album_id} })
        },

        async delete_album(album_id){
            album_id = album_id
            const response = await fetch("/delete_album", {
                method:"POST",
                headers: {
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({"album_id": album_id, "user_id": this.details.user_id})
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

        clear_msg(){
            this.msg = null
            this.$router.replace({path: this.$route.path})
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