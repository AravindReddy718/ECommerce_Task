import { useState } from "react";

function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const action = mode === "register" ? "register" : "login";
      const requestBody =
        mode === "register"
          ? formData
          : { email: formData.email, password: formData.password };

      const response = await fetch(
        `http://localhost:5001/api/auth/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not sign in");
      }

      onAuthSuccess(data.user, data.token);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode() {
    setMode((currentMode) =>
      currentMode === "login" ? "register" : "login"
    );
    setError("");
  }

  return (
    <div className="auth-page">

      <h1 className="auth-brand">My Online Shop</h1>
      <div className="auth-card">
        
        <h1>{mode === "login" ? "Sign in" : "Create an account"}</h1>

        {error && <p role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

              <label htmlFor="role">Account type</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            minLength="8"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Register"}
          </button>
        </form>

        <button type="button" onClick={switchMode}>
          {mode === "login"
            ? "Need an account? Register"
            : "Already registered? Sign in"}
        </button>
      </div>
    </div>
  );
}

export default AuthForm;