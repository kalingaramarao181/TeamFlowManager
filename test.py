import pandas as pd
projects = pd.read_csv("teamflow-projects.csv")
head = projects.dtypes
print(head)