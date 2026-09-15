from impact import calculate_farmer_benefit

result = calculate_farmer_benefit(
    quantity=500,
    traditional_price=28,
    direct_price=31,
    transport_cost=800
)

print("================================")
print("KISANMITRA FARMER IMPACT")
print("================================")
print("Traditional Income: ₹", result["traditional_income"])
print("KisanMitra Income:  ₹", result["direct_income"])
print("Benefit:            ₹", result["benefit"])
print("Benefit Percentage: ", result["benefit_percentage"], "%")
print("================================")