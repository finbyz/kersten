from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in kersten/__init__.py
from kersten import __version__ as version

setup(
	name="kersten",
	version=version,
	description="kersten",
	author="viral",
	author_email="viral@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
