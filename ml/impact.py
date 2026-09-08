def calculate_farmer_benefit(
    quantity,
    traditional_price,
    direct_price,
    transport_cost
):
    traditional_income = quantity * traditional_price

    direct_income = (
        quantity * direct_price
    ) - transport_cost

    benefit = direct_income - traditional_income

    benefit_percentage = (
        (benefit / traditional_income) * 100
        if traditional_income > 0
        else 0
    )

    return {
        "traditional_income": round(traditional_income, 2),
        "direct_income": round(direct_income, 2),
        "benefit": round(benefit, 2),
        "benefit_percentage": round(
            benefit_percentage,
            2
        )
    }


def calculate_consumer_benefit(
    quantity,
    traditional_price,
    direct_price
):
    traditional_cost = quantity * traditional_price

    direct_cost = quantity * direct_price

    savings = traditional_cost - direct_cost

    savings_percentage = (
        (savings / traditional_cost) * 100
        if traditional_cost > 0
        else 0
    )

    return {
        "traditional_cost": round(
            traditional_cost,
            2
        ),
        "direct_cost": round(
            direct_cost,
            2
        ),
        "savings": round(
            savings,
            2
        ),
        "savings_percentage": round(
            savings_percentage,
            2
        )
    }