// Import fetch module
import { fetchWithData, fetchWithGet } from '../modules/fetch.js';

export default class Candidate {

    id;
    lastname;
    firstname;
    email;
    cin;
    birthdate;
    phone;
    city;
    status;
    created_at;
    username;
    password;
    duplicate = false;

    //methods generate Password and login with
    generatePassword() {
        var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var length = 8;
        var retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        localStorage.setItem('password', retVal)
        return retVal;
    }
    generateLogin(email) {
        let login = email;
        login = login.replace('.', "");
        login = login.substring(0, login.lastIndexOf('@') + 0);
        localStorage.setItem('username', login);
        return login;
    }
    // Register
    async signUp(lastname, firstname, email, cin, birthdate, phone, city) {
        // Assign values to the parameters
        this.lastname = lastname;
        this.firstname = firstname;
        this.email = email;
        this.cin = cin;
        this.birthdate = birthdate;
        this.phone = phone;
        this.city = city;
        this.created_at = new Date().toISOString().slice(0, 10);
        // Init duplicate status
        this.duplicate = false;

        // Get all candidates and see if candidate already exists
        const data = await fetchWithGet(`http://localhost:3000/candidate/`);
        if (data.length > 0) {
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                if (data[i].email == this.email || data[i].cin == this.cin) {
                    console.log("Candidate already exists");
                    this.duplicate = true;
                    break;
                }
            }
        }

        // Create new candidate when there isn't a duplicate
        if (this.duplicate == false) {
            // Generate the fetch body data
            let body = {
                "lastname": this.lastname,
                "firstname": this.firstname,
                "email": this.email,
                "cin": this.cin,
                "birthdate": this.birthdate,
                "phone": this.phone,
                "city": this.city,
                "status": "Pending",
                "created_at": this.created_at,
                "username": this.generateLogin(this.email),
                "password": this.generatePassword(),
            }

            await fetchWithData('POST', 'http://localhost:3000/candidate/', body)
        }
    }

    // Login
    async signIn(username, password) {
        // Get the username and password entered
        this.username = username;
        this.password = password;

        // Get the candidate by it's username
        const data = await fetchWithGet(`http://localhost:3000/candidate/?username=${this.username}`);
        if (data.length > 0) {
            // Compare the password entered by the candidate's password
            if (data[0].password == this.password) {
                // Store the CIN in localstorage
                localStorage.setItem("CIN", data[0].cin);
                if (localStorage.getItem('password') || localStorage.getItem('username')) {
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                }
                // Redirect to the online test page
                location.replace('/onlinetest.html');
            } else {
                document.getElementById('sign-in-error').innerHTML = 'Mot de passe incorrect.';
                document.getElementById('password').classList.add('error');
            }
        } else {
            document.getElementById('sign-in-error').innerHTML = 'Identifiant incorrect.';
            document.getElementById('username').classList.add('error');
        }
    }

    // Get candidate by CIN from localstorage
    async getByCIN() {
        // Get the CIN if it exists
        if (localStorage.getItem('CIN')) {
            this.cin = localStorage.getItem('CIN');
            const data = await fetchWithGet(`http://localhost:3000/candidate/?cin=${this.cin}`);
            if (data.length > 0) {
                console.log(data);
                // When the candidate tries to navigate to other pages than the online test while his status is 'Pending'
                if (data[0].status == 'Pending' && window.location.pathname !== '/onlinetest.html') {
                    location.replace('/onlinetest.html');
                    // When the candidate tries to navigate to other pages than the sourcing while his status is 'Accepted'
                } else if (data[0].status == 'Accepted' && window.location.pathname !== '/sourcing.html') {
                    location.replace('/sourcing.html');
                } else if (data[0].status == 'Rejected' && window.location.pathname !== '/onlinetest.html') {
                    location.replace('/onlinetest.html');
                } else if (data[0].status == 'Sourced' && window.location.pathname !== '/sourcing.html') {
                    location.replace('/sourcing.html');
                }
                // If no candidate found with the CIN provided remove it from localstorage and redirect to homepage
            } else if (data.length === 0) {
                localStorage.removeItem('CIN');
                location.replace('/');
            }
        }
    }

    // Get all candidates
    async getAll() {
        const data = await fetchWithGet(`http://localhost:3000/candidate/`);
        if (data.length > 0) {
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                let name = document.createElement('div');
                name.setAttribute('class', 'candidates__element__col');
                name.innerHTML = data[i].firstname + ' ' + data[i].lastname;

                let email = document.createElement('div');
                email.setAttribute('class', 'candidates__element__col');
                email.innerHTML = data[i].email;

                let cin = document.createElement('div');
                cin.setAttribute('class', 'candidates__element__col');
                cin.innerHTML = data[i].cin;

                let created_at = document.createElement('div');
                created_at.setAttribute('class', 'candidates__element__col');
                created_at.innerHTML = data[i].created_at;

                let status;
                if (data[i].status === 'Accepted') {
                    status = document.createElement('div');
                    status.setAttribute('class', 'candidates__element__col');
                    status.innerHTML = data[i].status;
                } else if (data[i].status === 'Rejected') {
                    status = document.createElement('div');
                    status.setAttribute('class', 'candidates__element__col');
                    status.innerHTML = data[i].status;
                } else if (data[i].status === 'Pending') {
                    status = document.createElement('div');
                    status.setAttribute('class', 'candidates__element__col');
                    status.innerHTML = data[i].status;
                } else if (data[i].status === 'Sourced') {
                    status = document.createElement('div');
                    status.setAttribute('class', 'candidates__element__col');
                    status.innerHTML = data[i].status;
                }
                // if (data[i].status === 'Pending')

                let file;
                if (data[i].status === 'Accepted') {
                    let accepted = document.createElement('div');
                    accepted.setAttribute('class', 'candidates__element__col');
                    accepted.innerHTML = '<span class="material-icons accepted-icon">done</span>';
                    file = accepted;
                } else if (data[i].status === 'Rejected') {
                    let rejected = document.createElement('div');
                    rejected.setAttribute('class', 'candidates__element__col');
                    rejected.innerHTML = '<span class="material-icons rejected-icon">do_not_disturb</span>';
                    file = rejected;
                } else if (data[i].status === 'Pending') {
                    let pending = document.createElement('div');
                    pending.setAttribute('class', 'candidates__element__col');
                    pending.innerHTML = '<span class="material-icons pending-icon">pending</span>';
                    file = pending;
                } else if (data[i].status === 'Sourced') {
                    let pending = document.createElement('div');
                    pending.setAttribute('class', 'candidates__element__col sourced');
                    pending.innerHTML = `<span class="material-icons sourced-icon" data-cin="${data[i].cin}">file_download</span>`;
                    file = pending;
                }
                // if (data[i].status === 'Pending') 

                let element = document.createElement('div');
                element.setAttribute('class', 'candidates__element');

                document.querySelector('.candidates').appendChild(element);

                element.appendChild(name);
                element.appendChild(email);
                element.appendChild(cin);
                element.appendChild(created_at);
                element.appendChild(status);
                element.appendChild(file);
            }
        }
    }

    async updateStatus(status) {
        this.status = status;
        const body = {
            "status": this.status
        }
        this.cin = localStorage.getItem('CIN');
        const data = await fetchWithGet(`http://localhost:3000/candidate/?cin=${this.cin}`);
        this.id = data[0].id;
        await fetchWithData('PATCH', `http://localhost:3000/candidate/${this.id}`, body)
    }

    // Logout = remove CIN from localstorage and redirect to homepage
    logout() {
        localStorage.removeItem('CIN');
        location.replace('/');
    }
}