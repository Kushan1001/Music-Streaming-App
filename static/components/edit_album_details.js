export default{
    template:`
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Now Editing Album: {{album_name}} </h1>
            
            <div style="text-align:center; margin-top: 80px">
                <div v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                    <span style="font-weight: bold">{{ msg }}</span>
                    <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
                </div>
            </div>

            <div>
                <div style="margin-top:50px; text-align:center">
                    <label for="album_name">Updated Album Name:</label>
                    <input type="text" id="album_name" v-model="details.updated_album_name">
                    <button @click="updated_album_details">Edit</button>
                </div>
            </div>
        </div>

    `,

    data(){
        return{
            details:{
                album_id: this.$route.query["album_id"],
                updated_album_name: ""
            },
            msg: "",
            album_name: ""
        }
    },

    methods:{
        async updated_album_details(){
            const response = await fetch("/edit_album", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json()  
            
            if (response.ok){
                this.album_name = data.original_album_name
                console.log("success")
                this.$router.push({path: "/uploaded_creator_albums", query: {msg: "Details successfully updated"} })
            }
            else{
                this.msg = data.message
                console.log("failed")
            }
        },
        
        async get_album_details(){
            const response = await fetch("/album_details", {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json() 

            if (response.ok){
                this.album_name = data.album_name
                console.log("success")
            }
            else{
                this.msg = data.message
                console.log("failed")

            }    
        },

        clear_msg(){
            this.msg = null
        }
    },

    mounted(){
        this.get_album_details()
    }
}