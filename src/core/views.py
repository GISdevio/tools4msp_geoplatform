import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from core.libs import APIError, APIValidationError

logger = logging.getLogger('casestudies')

class RESTBaseViewSet(viewsets.ViewSet):
    def build_response(self, *args, data=None, status=status.HTTP_200_OK, errors=[], error_message=""):
        body = {'data': data}
        if len(errors) > 0 or error_message:
            body["error"] = {
                "message": error_message,
                "details": errors,
            }

        return Response(body, status=status)

    def build_validation_error(self, validation_errors=[], error_message=''):
        errors =[{'target': key if key != 'non_field_errors' else None, 'descriptions': errors} for key, errors in validation_errors.items()]
        return self.build_response(status=status.HTTP_400_BAD_REQUEST, errors=errors, error_message=error_message or 'Invalid data')

    def handle_exception(self, exc):
        if isinstance(exc, (ConnectionError)):
            return self.build_response(status=status.HTTP_503_SERVICE_UNAVAILABLE, error_message='Failed connection to tools4msp')
        if isinstance(exc, PermissionError):
            return self.build_response(error_message='Permission Denied', status=status.HTTP_403_FORBIDDEN)
        if isinstance(exc, APIValidationError):
            return self.build_response(error_message=exc.message, status=exc.status, errors={'non_field_errors': exc.data})
        if isinstance(exc, APIError):
            return self.build_response(error_message=exc.message, status=exc.status, errors={'non_field_errors': exc.data})


        return super().handle_exception(exc)



class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_next_link(self):
        if not self.page.has_next():
            return None
        page_number = self.page.next_page_number()
        return page_number

    def get_previous_link(self):
        if not self.page.has_previous():
            return None
        page_number = self.page.previous_page_number()
        return page_number
