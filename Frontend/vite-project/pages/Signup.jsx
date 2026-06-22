import { SignUp } from "@clerk/clerk-react";

function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <SignUp path="/signup" routing="path" signInUrl="/login" />
    </div>
  );
}

export default SignUpPage;