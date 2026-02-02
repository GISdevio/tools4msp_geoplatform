from django.db.models import Count, OuterRef, Subquery
from geonode.base.models import HierarchicalKeyword, TopicCategory, ThesaurusKeyword, ThesaurusKeywordLabel
from geonode.facets.providers.keyword import KeywordFacetProvider as BaseKeywordProvider
from geonode.facets.providers.category import CategoryFacetProvider as BaseCategoryProvider
from geonode.facets.providers.thesaurus import ThesaurusFacetProvider as BaseThesaurusProvider
from geonode.facets.models import DEFAULT_FACET_PAGE_SIZE, FACET_TYPE_THESAURUS

import logging
logger = logging.getLogger(__name__)


class KeywordFacetProvider(BaseKeywordProvider):
    def get_facet_items(self, queryset=None, start=0, end=DEFAULT_FACET_PAGE_SIZE, lang="en", topic_contains=None, keys=set(), **kwargs):
        filters = {"resourcebase__in": queryset}
        if topic_contains:
            filters["name__icontains"] = topic_contains
        if keys:
            filters["slug__in"] = keys

        q = (
            HierarchicalKeyword.objects.filter(**filters)
            .values("slug", "name")
            .annotate(count=Count("resourcebase"))
            .order_by("name")  # ORDINATO PER NOME
        )
        cnt = q.count()
        topics = [{"key": r["slug"], "label": r["name"], "count": r["count"]} for r in q[start:end].all()]
        return cnt, topics

    @classmethod
    def register(cls, registry, **kwargs):
        registry.register_facet_provider(KeywordFacetProvider(**kwargs))


class CategoryFacetProvider(BaseCategoryProvider):
    def get_facet_items(self, queryset=None, start=0, end=DEFAULT_FACET_PAGE_SIZE, lang="en", topic_contains=None, keys=set(), **kwargs):
        filters = {"resourcebase__in": queryset}
        if topic_contains:
            filters["gn_description__icontains"] = topic_contains
        if keys:
            filters["identifier__in"] = keys

        q = (
            TopicCategory.objects.values("identifier", "gn_description", "fa_class")
            .filter(**filters)
            .annotate(count=Count("resourcebase"))
            .order_by("gn_description")  # ORDINATO PER NOME
        )
        cnt = q.count()
        topics = [{"key": r["identifier"], "label": r["gn_description"], "count": r["count"], "fa_class": r["fa_class"]} for r in q[start:end].all()]
        return cnt, topics

    @classmethod
    def register(cls, registry, **kwargs):
        registry.register_facet_provider(CategoryFacetProvider(**kwargs))


class ThesaurusFacetProvider(BaseThesaurusProvider):
    """Custom ThesaurusFacetProvider che ordina per nome invece che per count"""
    
    def get_facet_items(self, queryset, start=0, end=DEFAULT_FACET_PAGE_SIZE, lang="en", topic_contains=None, keys=set(), **kwargs):
        filter = {"thesaurus__identifier": self._name, "resourcebase__in": queryset}
        if topic_contains:
            filter["label__icontains"] = topic_contains
        if keys:
            filter["id__in"] = keys

        q = (
            ThesaurusKeyword.objects.filter(**filter)
            .values("id", "alt_label", "image")
            .annotate(count=Count("resourcebase"))
            .annotate(
                localized_label=Subquery(
                    ThesaurusKeywordLabel.objects.filter(keyword=OuterRef("id"), lang=lang).values("label")
                )
            )
            .order_by("localized_label", "alt_label")  # ORDINATO PER NOME
        )

        cnt = q.count()
        topics = [
            {
                "key": r["id"],
                "label": r["localized_label"] or r["alt_label"],
                "is_localized": r["localized_label"] is not None,
                "count": r["count"],
                "image": r["image"],
            }
            for r in q[start:end].all()
        ]
        return cnt, topics

    @classmethod
    def register(cls, registry, **kwargs):
        from geonode.base.models import Thesaurus

        q = (
            Thesaurus.objects.filter(facet=True)
            .values("identifier", "title", "order", "rel_thesaurus__label", "rel_thesaurus__lang")
            .order_by("order")
        )

        ret = {}
        for r in q.all():
            identifier = r["identifier"]
            t = ret.get(identifier, None)
            if not t:
                t = {k: r[k] for k in ("identifier", "title", "order")}
                t["labels"] = {}
            if r["rel_thesaurus__lang"] and r["rel_thesaurus__label"]:
                t["labels"][r["rel_thesaurus__lang"]] = r["rel_thesaurus__label"]
            ret[identifier] = t

        for t in ret.values():
            registry.register_facet_provider(
                ThesaurusFacetProvider(t["identifier"], t["title"], t["order"], t["labels"], **kwargs)
            )