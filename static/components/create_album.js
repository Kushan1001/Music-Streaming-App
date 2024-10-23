export default{
    template: `
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Create New Album</h1>

            <div style="margin-left:550px; margin-top:150px">

                <div v-if="this.msg" style="text-align:center; margin-top: 80px; margin-left:120px">
                    <span style="font-weight: bold">{{msg}}</span>
                    <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
                </div>

                <div style="margin-top:10px">
                    <label for="album_name">Album Name: </label>
                    <input type="text" id="album_name" v-model="details.album_name">
                    <span>
                        <button @click="create_album">Create Album</button>
                        <button @click="go_back">Go to creator dashboard</button>
                    </span>
                </div>
            </div>
        </div>
    `,

    data(){
        return{
            details:{
                album_name: null,
                user_id: localStorage.getItem('user_id')
            },
            msg: null
        }
    },

    methods:{
        async create_album(){
            const response = await fetch("/create_album", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.details)
            })

            const data = await response.json()
            if (response.ok){
                this.$router.push("/select_album")
                console.log('sucess')
            }
            else{
                this.msg = data.message
            }           
        },
        go_back(){
            this.$router.push("/creator_dashboard")
        },

        clear_msg(){
            this.msg = null
        }
    }
}