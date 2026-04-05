import json
import random
import string

def random_string(length=20):
    """Generates a random string of characters."""
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def generate_record(i):
    """Generates a record object of random data."""
    return {
        "id": f"record_{i:06d}",
        "name": random_string(),
        "email": f"{random_string(10)}@{random_string(6)}.com",
        "score": round(random.uniform(0, 100), 2),
        "active": random.choice([True, False]),
        "tags": [random_string(8) for _ in range(3)],
        "meta": {
            "created": f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
            "value": random.randint(100, 9999)
        }
    }

def generate_until(target_bytes, filename):
    """Generates a JSON string of at least the target number of bytes
    and writes it to a JSON file.

    Parameters:
    target_bytes (int): min number of bytes to generate
    filename (string): output file name 
    """
    records = []
    i = 0
    while True:
        records.append(generate_record(i))
        i += 1
        if i % 100 == 0:
            size = len(json.dumps({"records": records}).encode('utf-8'))
            print(f"{i} records — {size:,} bytes")
            if size >= target_bytes:
                break
    with open(filename, 'w') as f:
        json.dump({"records": records}, f)
    print(f"Written to {filename}")

generate_until(256_000, "test_250kb.json")
generate_until(512_000, "test_500kb.json")
generate_until(1_048_576, "test_1mb.json")