// Replace with your Supabase project credentials
const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_API_KEY;

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log(SUPABASE_URL, SUPABASE_ANON_KEY)
async function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { user, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Sign-up successful! Check your email for verification.");
        checkUser();
    }
}

async function signIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Sign-in successful!");
        checkUser();
    }
}

async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Signed out successfully!");
        checkUser();
    }
}

// Check if user is logged in
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        document.getElementById("auth-form").style.display = "none";
        document.getElementById("user-info").style.display = "block";
        document.getElementById("user-email").innerText = "Logged in as: " + user.email;
    } else {
        document.getElementById("auth-form").style.display = "block";
        document.getElementById("user-info").style.display = "none";
    }
}

// Run checkUser when page loads
checkUser();
