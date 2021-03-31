---
author: Travis Hathaway
title: Postgres Connections with Python Decorators
date: 2017-04-13
category: Dev
description: Learn how to use decorators in Python by walking through a practical example using a PostgreSQL database connections.
featured_image: "/img/post_images/floral-pattern-background-171"
featured_image_thumbnail: "/img/post_images/floral-pattern-background-171_small"
show_featured_image: true
tags: [python, database, software]
layout: layouts/post.njk
---

## Summary
In this post, I will walk through creating a decorator function in Python to handle the set up and tear down of PostgreSQL connections.  For the impatient who need only the code sans banter, I have conveniently created this **[Gist](https://gist.github.com/travishathaway/b67c32f6fed3bcc9cb8ac72e611961bb)** for you.

## The Problem
Recently, I was pouring over a module written for a CLI ascript in Python. This particular CLI script required a connection to a PostgreSQL database and the module handled it in the following way:

```python
# process_db_stuff.py
import psycopg2
import os

connection = psycopg2.connect(
    host=os.getenv('DB_HOST', '127.0.0.1'),
    port=os.getenv('DB_PORT', 5432),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASS'),
    dbname=os.getenv('DB_NAME')
)
cursor = connection.cursor()
def process_db_stuff(data):
    try:
        # Do some DB stuff
    finally:
        connection.commit()
        connection.close()
```

There are couple problems with this approach.  Here are a few that immediately come to mind:

- A connection to the database is made as soon as the module is imported.  *Explicit is better than implicit*, so using this pricinple, I should make sure my module imports do not have unintended consequences.
- The code in this module is not very portable. Specifically, we are relying upon a module level variable `cursor` the entire time while interacting with our database.

<hr>

## There must be a better way

Enter the world of Python decorators.  A Python decorator is a programing pattern where you wrap the function that handles the main logic being performed. One of the better known use cases of the decorator pattern in the wild is the Flask's app routing decorator. This is how flask registers functions to application routes ([Read this great post for more information on how this works](https://ains.co/blog/things-which-arent-magic-flask-part-1.html)).  Another great example of decorators in action are [Django authentication decorators](https://docs.djangoproject.com/en/1.11/topics/auth/default/#the-login-required-decorator)

For my use case, I will need to handle both the set up and tear down of a database connection. I will also be using a decorator where I can pass in arguments.  In this case, the argument will be the information necessary to make a database connection.

With all of those requirements in mind, here is the decorator function that fit my use case. Below is the definition of this decorator and a simple use case:

```python
def psycopg2_cur(conn_info):
    """Wrap function to setup and tear down a Postgres connection while 
    providing a cursor object to make queries with.
    """
    def wrap(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                # Setup postgres connection
                connection = psycopg2.connect(**conn_info)
                cursor = connection.cursor()
                # Call function passing in cursor
                return_val = f(cursor, *args, **kwargs)
            finally:
                # Close connection
                connection.commit()
                connection.close()
            
            return return_val
        return wrapper
    return wrap
# Define the psycopg2 kwargs here
PSQL_CONN = {
    'host': '127.0.0.1',
    'port': '5432',
    'user': 'postgres',
    'password': '',
    'dbname': 'postgres'
}
@psycopg2_cur(PSQL_CONN)
def tester(cursor):
    """Test function that uses our psycopg2 decorator
    """
    cursor.execute('SELECT 1 + 1')
    return cursor.fetchall()
```

With this design pattern, we have moved ourselves much closer to explicit, modular code that eliminates a lot of setup and teardown boilerplate and makes our code much more readible.  The above code could be extended in many ways such adding better logic for transaction handling or using a callable object instead to manage single shared connection. For my use case, command line scripts that perform a single action, setting up and tearing down a single database connection per function works perfectly.

Hope you found this useful!
