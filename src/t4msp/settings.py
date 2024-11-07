# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2017 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

# Django settings for the GeoNode project.
import os
import ast

try:
    from urllib.parse import urlparse, urlunparse
    from urllib.request import urlopen, Request
except ImportError:
    from urllib2 import urlopen, Request
    from urlparse import urlparse, urlunparse
# Load more settings from a file called local_settings.py if it exists
try:
    from t4msp.local_settings import *
#    from geonode.local_settings import *
except ImportError:
    from geonode.settings import *

#
# General Django development settings
#
PROJECT_NAME = "t4msp"

# add trailing slash to site url. geoserver url will be relative to this
if not SITEURL.endswith("/"):
    SITEURL = "{}/".format(SITEURL)

SITENAME = os.getenv("SITENAME", "t4msp")

# Defines the directory that contains the settings file as the LOCAL_ROOT
# It is used for relative settings elsewhere.
LOCAL_ROOT = os.path.abspath(os.path.dirname(__file__))
# /home/ilpise/gisdevio/t4msp/src/t4msp


PROJECT_ROOT = os.path.abspath(os.path.dirname(os.path.basename(__file__))) # for geodatabuilders and casestudies
# /home/ilpise/gisdevio/t4msp/src is the django project root

# PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WSGI_APPLICATION = "{}.wsgi.application".format(PROJECT_NAME)

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = os.getenv("LANGUAGE_CODE", "en")

if PROJECT_NAME not in INSTALLED_APPS:
    INSTALLED_APPS += (PROJECT_NAME,)

# Location of url mappings
ROOT_URLCONF = os.getenv("ROOT_URLCONF", "{}.urls".format(PROJECT_NAME))


# STATICFILES_FINDERS = [
#     'django.contrib.staticfiles.finders.FileSystemFinder',
#     'django.contrib.staticfiles.finders.AppDirectoriesFinder',
# ]
# Additional directories which hold static files
# - Give priority to local geonode-project ones - seems to be the destination folders for collectstatic
STATICFILES_DIRS = [
    os.path.join(LOCAL_ROOT, "static"),
    # os.path.join(PROJECT_ROOT, "frontend", "static"), # for geodatabuilders and casestudies
    # os.path.join(PROJECT_ROOT, "static"),
    # '/home/ilpise/gisdevio/.gpvenv/src/wagtail/wagtail/admin/static'
] + STATICFILES_DIRS

#STATICFILES_DIRS is ['/home/ilpise/gisdevio/t4msp/src/t4msp/static',
#                    '/home/ilpise/gisdevio/t4msp/src/static',
#                    '/home/ilpise/gisdevio/.gpvenv/src/geonode/geonode/static']

# Location of locale files
LOCALE_PATHS = (os.path.join(LOCAL_ROOT, "locale"),) + LOCALE_PATHS

TEMPLATES[0]["DIRS"].insert(0, os.path.join(LOCAL_ROOT, "templates"))
loaders = TEMPLATES[0]["OPTIONS"].get("loaders") or [
    "django.template.loaders.filesystem.Loader",
    "django.template.loaders.app_directories.Loader",
]
# loaders.insert(0, 'apptemplates.Loader')
TEMPLATES[0]["OPTIONS"]["loaders"] = loaders
TEMPLATES[0].pop("APP_DIRS", None)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "verbose": {
            "format": "%(levelname)s %(asctime)s %(module)s %(process)d "
            "%(thread)d %(message)s"
        },
        "simple": {
            "format": "%(message)s",
        },
    },
    "filters": {"require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}},
    "handlers": {
        "console": {
            "level": "ERROR",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "ERROR",
        },
        "geonode": {
            "handlers": ["console"],
            "level": "INFO",
        },
        "geoserver-restconfig.catalog": {
            "handlers": ["console"],
            "level": "ERROR",
        },
        "owslib": {
            "handlers": ["console"],
            "level": "ERROR",
        },
        "pycsw": {
            "handlers": ["console"],
            "level": "ERROR",
        },
        "celery": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
        "mapstore2_adapter.plugins.serializers": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
        "geonode_logstash.logstash": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}

CENTRALIZED_DASHBOARD_ENABLED = ast.literal_eval(
    os.getenv("CENTRALIZED_DASHBOARD_ENABLED", "False")
)
if (
    CENTRALIZED_DASHBOARD_ENABLED
    and USER_ANALYTICS_ENABLED
    and "geonode_logstash" not in INSTALLED_APPS
):
    INSTALLED_APPS += ("geonode_logstash",)

    CELERY_BEAT_SCHEDULE["dispatch_metrics"] = {
        "task": "geonode_logstash.tasks.dispatch_metrics",
        "schedule": 3600.0,
    }

LDAP_ENABLED = ast.literal_eval(os.getenv("LDAP_ENABLED", "False"))
if LDAP_ENABLED and "geonode_ldap" not in INSTALLED_APPS:
    INSTALLED_APPS += ("geonode_ldap",)

# Add your specific LDAP configuration after this comment:
# https://docs.geonode.org/en/master/advanced/contrib/#configuration


# Wagtail integration

INSTALLED_APPS +=('wagtail.contrib.forms',
                'wagtail.contrib.redirects',
                'wagtail.embeds',
                'wagtail.sites',
                'wagtail.users',
                'wagtail.snippets',
                'wagtail.documents',
                'wagtail.images',
                'wagtail.search',
                'wagtail.admin',
                'wagtail',
                'modelcluster',
                # 'taggit' # error django.core.exceptions.ImproperlyConfigured: Application labels aren't unique, duplicates: taggit
                )

MIDDLEWARE += (#'allauth.account.middleware.AccountMiddleware', # django.core.exceptions.ImproperlyConfigured: allauth.account.middleware.AccountMiddleware must be added to settings.MIDDLEWARE
              #'django.contrib.sessions.middleware.SessionMiddleware',
              #'django.contrib.auth.middleware.AuthenticationMiddleware',
              #'django.contrib.messages.middleware.MessageMiddleware',
              'wagtail.contrib.redirects.middleware.RedirectMiddleware',)

# Add a STATIC_ROOT setting, if your project doesn’t have one already
# STATIC_ROOT is the destination of static files
#
# You have requested to collect static files at the destination
# location as specified in your settings:
# STATIC_ROOT is '/home/ilpise/gisdevio/.gpvenv/src/geonode/geonode/static_root'

MEDIA_ROOT = os.path.join(LOCAL_ROOT, 'media')
MEDIA_URL = '/media/'

WAGTAIL_SITE_NAME = 'My Example Site'

WAGTAILADMIN_BASE_URL = 'http://example.com'

WAGTAILDOCS_EXTENSIONS = ['csv', 'docx', 'key', 'odt', 'pdf', 'pptx', 'rtf', 'txt', 'xlsx', 'zip']
