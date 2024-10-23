export default{
    template: `
        <div>
            <div v-if="albums.length == 0">
                <h1 style="text-align: center; margin-top: 2px; font-size:50px">
                    No Albums available for the given creator ID<h1>
            </div>

            <div v-else>
                <h1 style="text-align: center; margin-top: 2px; font-size:50px">Available Albums</h1>

                <div style="display:flex; justify-content:center; margin-top:80px; margin-right:150px">
                    <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                        <tr>
                            <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Album Name</th>
                        </tr>

                        
                        <tr v-for="(album, index) in albums.slice().reverse()">  
                            <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                            <td style="border:1px solid black; padding:5px; text-align:center">{{album.album_name}}</td>
                            <td style="border:1px solid black; padding:5px; text-align:center">
                                <button @click="upload_song(album.album_id)">Upload Song</button</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div style="text-align:center; margin-right:200px; margin-top:50px">
                <span><button @click="create_new_album">Create New Album</button>
                    <button @click="go_back">Go to creator dashboard</button></span>
            </div>
        </div>
    `,

    data(){
        return{
            details:{
                user_id: localStorage.getItem('user_id')
            },
            albums: [],
            mesg: null
        }
    },

    methods:{
        async select_album(){
            const response = await fetch("/select_album", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
            },
            body: JSON.stringify(this.details)
        })

        const data = await response.json()
        if (response.ok){
            this.albums = data.data
        }
        else {
            data.msg = data.messgae
            }
        },
        upload_song(album_id){
            this.$router.push({path:"/upload_song", query: {album_id: album_id} })
        },
        create_new_album(){
            this.$router.push("/create_album")
        },
        go_back(){
            this.$router.push("/creator_dashboard")
        }    
    },

    mounted(){
        this.select_album()
    }
}
