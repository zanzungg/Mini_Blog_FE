export const ensureSuccess = (payload, fallback = 'Request failed') => {
  if (payload?.status === 'success') {
    return payload.data;
  }

  const error = new Error(payload?.message || fallback);

  error.details = payload;

  throw error;
};

export const normalizeError = (payload, fallback = 'Something went wrong') => {
  if (!payload) {
    return {
      message: fallback,
    };
  }

  if (payload.status === 'error') {
    return payload;
  }

  return {
    message: fallback,
  };
};
