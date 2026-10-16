export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  return {};
}

export async function registerAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  return {};
}

export async function forgotPasswordAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  return {};
}

export async function logoutAction(): Promise<void> {}
