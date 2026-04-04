package br.com.projeto.taskmanager.dto;

public class ApiResponseDTO<T> {

    private boolean success;
    private String message;
    private T data;
    private Object errors;

    public ApiResponseDTO() {
    }

    public ApiResponseDTO(boolean success, String message, T data, Object errors) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    public static <T> ApiResponseDTO<T> success(String message, T data) {
        return new ApiResponseDTO<>(true, message, data, null);
    }

    public static <T> ApiResponseDTO<T> success(T data) {
        return new ApiResponseDTO<>(true, null, data, null);
    }

    public static <T> ApiResponseDTO<T> error(String message, Object errors) {
        return new ApiResponseDTO<>(false, message, null, errors);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Object getErrors() {
        return errors;
    }

    public void setErrors(Object errors) {
        this.errors = errors;
    }
}