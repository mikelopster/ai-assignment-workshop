package customsort

import (
	"reflect"
	"testing"
)

func TestSortPeopleByAge_EmptySlice(t *testing.T) {
	t.Parallel()
	input := []Person{}
	expected := []Person{}

	SortPeopleByAge(input)

	if !reflect.DeepEqual(input, expected) {
		t.Errorf("Test Failed: Expected %v, Got %v", expected, input)
	}
}

func TestSortPeopleByAge_SingleElement(t *testing.T) {
	t.Parallel()
	input := []Person{{"Alice", 30}}
	expected := []Person{{"Alice", 30}}

	SortPeopleByAge(input)

	if !reflect.DeepEqual(input, expected) {
		t.Errorf("Test Failed: Expected %v, Got %v", expected, input)
	}
}

func TestSortPeopleByAge_AlreadySorted(t *testing.T) {
	t.Parallel()
	input := []Person{
		{"Bob", 25},
		{"Alice", 30},
		{"Charlie", 35},
	}
	expected := []Person{
		{"Bob", 25},
		{"Alice", 30},
		{"Charlie", 35},
	}

	SortPeopleByAge(input)

	if !reflect.DeepEqual(input, expected) {
		t.Errorf("Test Failed: Expected %v, Got %v", expected, input)
	}
}

func TestSortPeopleByAge_ReverseSorted(t *testing.T) {
	t.Parallel()
	input := []Person{
		{"Charlie", 35},
		{"Alice", 30},
		{"Bob", 25},
	}
	expected := []Person{
		{"Bob", 25},
		{"Alice", 30},
		{"Charlie", 35},
	}

	SortPeopleByAge(input)

	if !reflect.DeepEqual(input, expected) {
		t.Errorf("Test Failed: Expected %v, Got %v", expected, input)
	}
}

func TestSortPeopleByAge_Unsorted(t *testing.T) {
	t.Parallel()
	input := []Person{
		{"David", 28},
		{"Eve", 22},
		{"Frank", 31},
		{"Grace", 22}, // Duplicate age
	}
	expected := []Person{
		{"Eve", 22},
		{"Grace", 22},
		{"David", 28},
		{"Frank", 31},
	}

	SortPeopleByAge(input)

	if !reflect.DeepEqual(input, expected) {
		t.Logf("Note: Order of elements with the same age might differ if using unstable sort.")
		t.Errorf("Test Failed:\nExpected (or similar order for same age): %v\nGot: %v", expected, input)
	}
}

func TestSortPeopleByAge_WithZeros(t *testing.T) {
	t.Parallel()
	input := []Person{
		{"Heidi", 30},
		{"Ivan", 0}, // Age zero
		{"Judy", 25},
	}
	expected := []Person{
		{"Ivan", 0},
		{"Judy", 25},
		{"Heidi", 30},
	}

	SortPeopleByAge(input)

	if !reflect.DeepEqual(input, expected) {
		t.Errorf("Test Failed: Expected %v, Got %v", expected, input)
	}
}

