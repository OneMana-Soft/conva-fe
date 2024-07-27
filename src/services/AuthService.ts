
class AuthService {
    static async loginWithGoogle() {
      // You'll need to replace the following URL with your actual OAuth login endpoint
      const oauthEndpoint = `${import.meta.env.VITE_BACKEND_URL}oauth_login/google?redirect_uri=${import.meta.env.VITE_FRONTEND_URL}onboarding`;

      window.location.href = oauthEndpoint;
    }

    static async loginWithGithub() {
      // You'll need to replace the following URL with your actual OAuth login endpoint
      const oauthEndpoint = `${import.meta.env.VITE_BACKEND_URL}/oauth_login/github?redirect_uri=${import.meta.env.VITE_FRONTEND_URL}onboarding`;

      window.location.href = oauthEndpoint;

    }
  }
  
  export default AuthService;
  