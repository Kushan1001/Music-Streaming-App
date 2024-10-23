export default{
    template: `
    <div>
        <h1 style="text-align: center; margin-top: 2px">Please Enter Your Details</h1>
        
        <div style="text-align: center; margin-top:100px; margin-right:50px">
            <div style="text-align:center; margin-top: 80px; margin-left:80px">
                <div v-if="msg" style="background-color: #b3b300; padding: 10px; border-radius: 5px">
                    <span style="font-weight: bold">{{ msg }}</span>
                    <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding: 5px; border: none; border-radius: 3px">Close</button>
                </div>
            </div>

            <div style="margin-top:30px">
                <label for="email_id" style="width: 90px">Email ID: </label>
                <input type="email" id="email_id" required="True" pattern=".+@gmail.com" v-model="details.email_id">
            </div>
            <br>

            <div>
                <label for="pwd" style="width: 90px">Password: </label>
                <input type="password" id="pwd" required="True" v-model="details.password">
            </div>
            <br>

            <div>
                <label for="username" style="width: 90px">User Name: </label>
                <input type="text" id="username" required="True" v-model="details.username">
            </div>
            <br>

            <div>
                <label for="f_name" style="width: 90px">First Name: </label>
                <input type="text" id="f_name" required="True" v-model="details.first_name">
            </div>
            <br>

            <div>
                <label for="l_name" style="width: 90px">Last Name: </label>
                <input type="text" id="l_name" required="True" v-model="details.last_name">
            </div>
            <br>

            <div style="margin-right:100px  ">
                <label id="role">Select Role:</label>
                <select for="role" v-model="details.role">
                    <option value="general_user">User</option>
                    <option value="creator">Creator</option>
                </select>
            </div>
            <span><button style="text-align: center; margin-top: 20px" @click="signup">SignUp</button >
            <button style="margin-left:5px" @click="go_to_login">Go to Login</button></span>
        </div>
    </div>
    `,

    data(){
        return{
            details:{
                email_id: null,
                password: null,
                username: null,
                first_name: null,
                last_name: null,
                role: "general_user"
                },
            msg: null,
        }
    },

    methods:{
        async signup(){
            const response = await fetch('/signup', {
                method : "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(this.details)

            })

            const data =  await response.json()
            if (response.ok){
                this.$router.push({path:"/signin", query:{msg: "User successfully registered. Please Login"} })
                this.msg = data.message
            }
            else{
                this.msg = data.message
            }

        },
        go_to_login(){
            this.$router.push("/signin")
        },

        clear_msg(){
            this.msg = null
        }
    }
}