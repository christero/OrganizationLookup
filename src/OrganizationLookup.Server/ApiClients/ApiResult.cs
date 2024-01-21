using System.Net;

namespace OrganizationLookup.Server.ApiClients
{
    public class ApiResult<T>
    {
        public bool IsSuccess { get; init; }
        public T? Value { get; init; }
        public HttpStatusCode StatusCode { get; init; }

        private ApiResult(bool isSuccess, T? value, HttpStatusCode statusCode)
        {
            IsSuccess = isSuccess;
            Value = value;
            StatusCode = statusCode;
        }

        public static ApiResult<T> Success(T value)
        {
            return new ApiResult<T>(true, value, HttpStatusCode.OK);
        }

        public static ApiResult<T> Failure(HttpStatusCode statusCode)
        {
            return new ApiResult<T>(false, default, statusCode);
        }
    }
}
