import { SignIn } from "@clerk/clerk-react";

function LoginPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <SignIn path="/login" routing="path" signUpUrl="/signup" />
    </div>
  );
}

export default LoginPage;