export default{
    template:`
        <div>
            <h1 style="text-align: center; margin-top: 2px">Enter Details to Login</h1>

            <div style="text-align: center; margin-top:100px; margin-right:50px">
                
                <div style="text-align:center; margin-top: 80px; margin-left:80px">
                    <div v-if="msg1" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                        <span style="font-weight: bold">{{ msg1 }}</span>
                        <button @click="clear_msg1" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
                    </div>
                </div>

                <div style="text-align:center; margin-top: 80px; margin-left:80px">
                    <div v-if="msg2" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                        <span style="font-weight: bold">{{ msg2 }}</span>
                        <button @click="clear_msg2" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
                    </div>
                </div>

                <div style="margin-top:25px">
                    <label for="email" style="width: 90px">Email ID: </label>
                    <input type="email" id="email" v-model="details.email_id">
                </div>
                <div style="margin-top:20px;">
                    <label for="password" style="width: 90px">Password: </label>
                    <input type="password" id="password" v-model="details.password">
                </div> 
                <br>

                <div style="margin-right:100px  ">
                    <label id="role">Select Role:</label>
                        <select for="role" v-model="details.role">
                            <option value="general_user">User</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                        </select>
                </div>
             <span><button style="text-align: center; margin-top: 20px; margin-left: 50px" @click="signin">SignIn</button>
             <button @click="signup">SignUp</button></span>
            </div>
        </div>
        `,
    
    data(){
        return{
            details:{
                email_id:null,
                password:null,
                role: 'general_user'
            },
            msg1: null,
            msg2: this.$route.query['msg']
        }  
    },

    methods:{
        async signin(){
            const response = await fetch("/signin", {
                method : "POST",
                headers : {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.details) //data sent 
            })
            const data = await response.json()
            if (response.ok){
                localStorage.setItem("auth-token", data.token)
                localStorage.setItem("role", data.role)
                localStorage.setItem("user_id", data.user_id)
                localStorage.setItem("username", data.username)  
                
                const response = await fetch('/set_visit_status', {
                    method: "POST",
                    headers:{
                        "Content-Type": "application/json"
                    }, body: JSON.stringify({"user_id": localStorage.getItem('user_id')})
                })

                if (response.ok){
                    if (localStorage.getItem("role") == "admin"){
                        this.$router.push("/admin_dashboard/")
                    }
                    else if (localStorage.getItem("role") == "general_user"){
                        this.$router.push("/user_dashboard")
                    }
                    else if (localStorage.getItem("role") == "creator"){
                        this.$router.push("/creator_dashboard")
                    }
                }
            }
            else{
                this.msg1 = data.message
                }
        
            },signup(){
                this.$router.push("/signup")
            },

            clear_msg1(){
                this.msg1 = null
            },

            clear_msg2(){
                this.msg2 = null
                this.$router.replace({path: this.$route.path})

            }
        }  
    }
  