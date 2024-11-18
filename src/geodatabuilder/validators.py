from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import pyparsing as pp
from functools import reduce

# for recursive infix notations, or those with many precedence levels, it is best to enable packrat parsing
pp.ParserElement.enablePackrat()
LPAREN, RPAREN = map(pp.Suppress, "()")

arith_expr= pp.Forward()


FN_NAMES = [
    'MAX', 'MIN', 'AVG', 'LOG', 'RESCALE', 'GAUSSIAN_FILTER', 'MASK_GREAT', 'logical_and', 'logical_or',
]

fn_name = reduce(lambda prev, curr: prev | pp.Literal(curr) if prev else pp.Literal(curr), FN_NAMES)
var_name = pp.Word('$', pp.alphanums)

fn_call = pp.Group(fn_name + LPAREN - pp.Group(pp.Optional(pp.delimitedList(arith_expr))) + RPAREN)
arith_operand = fn_call | var_name | pp.pyparsing_common.number

plus_minus_operator = pp.oneOf("+ -")
mult_div_operator = pp.oneOf("* /")
comparision_operator = pp.oneOf("> >= < <= == !=")

arith_expr <<= pp.infixNotation(arith_operand,
    [
        (mult_div_operator, 2, pp.opAssoc.LEFT,),
        (plus_minus_operator, 2, pp.opAssoc.LEFT,),
        (comparision_operator, 2, pp.opAssoc.LEFT,),
    ]
)


def validate_expression(value):
    error = None
    try:
        arith_expr.parseString(value, parseAll=True)
    except pp.ParseException as e:
        error = e

    if error:
        raise ValidationError(error.explain())
