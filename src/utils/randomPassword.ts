import { GeneratePassword } from "js-generate-password";

const randomPassword = () => GeneratePassword({
  length: 14,
  symbols: true,
});

export default randomPassword;