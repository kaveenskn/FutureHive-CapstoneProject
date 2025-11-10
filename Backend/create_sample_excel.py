"""
create_sample_excel.py
Creates a sample Excel template for bulk research upload
"""

import pandas as pd

# Sample data
data = {
    'Title': [
        'Machine Learning Applications in Healthcare',
        'Quantum Computing for Cryptography',
        'Sustainable Energy Solutions Using AI',
        'Neural Networks for Image Recognition',
        'Blockchain Technology in Supply Chain'
    ],
    'Abstract': [
        'This research explores the application of machine learning algorithms in healthcare diagnosis and treatment planning.',
        'An investigation into quantum computing techniques for enhancing modern cryptographic systems.',
        'This paper discusses AI-driven approaches to optimize renewable energy production and distribution.',
        'A comprehensive study on deep neural networks for advanced image recognition and classification tasks.',
        'Examining the implementation of blockchain technology to improve transparency in supply chain management.'
    ],
    'Author': [
        'Dr. Sarah Chen',
        'Prof. Michael Kumar',
        'Dr. Emily Rodriguez',
        'Dr. James Wang',
        'Prof. Lisa Thompson'
    ],
    'Year': [
        2024,
        2024,
        2023,
        2023,
        2024
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# Save to Excel
output_file = './datas/research_upload_template.xlsx'
df.to_excel(output_file, index=False)

print(f"✅ Sample Excel template created: {output_file}")
print("\nTemplate structure:")
print(df.head())
print("\nYou can use this template for bulk upload!")
print("\nColumns required:")
print("- Title: Research paper title")
print("- Abstract: Full abstract of the research")
print("- Author: Author name(s)")
print("- Year: Publication year")
