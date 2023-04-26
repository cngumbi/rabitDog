import { register } from "../api";
import { getUserInfo, setUserInfo } from "../localStorage";
import { redirectUser } from "../utils";

const RegistarSection = {
    after_render: ()=>{
        document
            .getElementById('registarForm')
            .addEventListener('submit', async(q)=>{
                q.preventDefault();
                const data = await register({
                    password: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                    
                });
                if(data.error){
                    //showMessage(data.error);
                }else{
                    setUserInfo(data);
                    //redirectUser();
                    document.location.hash = '/dashboard';
                }
            })
    },
    render: ()=>{
        if(getUserInfo().name){
            //redirectUser();
            document.location.hash = '/dashboard';
        }
        return`
        <section class="section">
            <div class="container">
                <div class="row">
                    <div class="section-title padding">
                        <h2>Add User</h2>
                    </div>
                </div>
                <div class="row">
                    <form id="registarForm" class="contact-form padding">
                        <div class="row block-display">
                            <div class="form-item col-6 padding">
                                <div class="form-group">
                                    <input type="text" class="form-control " name="name" id="name" placeholder="Name">
                                </div>
                            </div>
                            <div class="form-item col-6 padding">
                                <div class="form-group">
                                    <input type="email" class="form-control " name="email" id="email" placeholder="Email">
                                </div>
                            </div>
                            <div class="form-item col-6 padding">
                                <div class="form-group">
                                    <input type="password" class="form-control" name="password" id="password" placeholder="password">
                                </div>
                            </div>
                            <div class="form-item col-6 padding">
                                <div class="form-group">
                                    <input type="password" class="form-control " name="confirmPassword" id="confirmPassword" placeholder="Confirm Password">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-item col-12 padding">
                                <button type="submit" class="btn">Add User</button>
                               
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
        `;
    }
}
export default RegistarSection;