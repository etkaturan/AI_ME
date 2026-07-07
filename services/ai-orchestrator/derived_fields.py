from datetime import date


def calculate_age(date_of_birth: date, as_of: date | None = None) -> int:
    """Computes age at request time — never store age directly, always derive it."""
    if as_of is None:
        as_of = date.today()

    age = as_of.year - date_of_birth.year
    had_birthday_this_year = (as_of.month, as_of.day) >= (date_of_birth.month, date_of_birth.day)
    if not had_birthday_this_year:
        age -= 1
    return age