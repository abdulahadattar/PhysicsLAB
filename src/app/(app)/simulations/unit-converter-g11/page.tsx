
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Ruler, Scale, ClockIcon } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type UnitCategory = "Length" | "Mass" | "Time";

interface Unit {
  label: string;
  value: string;
  category: UnitCategory;
  toBase: (val: number) => number; // Converts to a base unit (e.g., meters, kg, seconds)
  fromBase: (val: number) => number; // Converts from base unit
}

const units: Unit[] = [
  // Length (Base: Meter)
  { label: "Meters (m)", value: "m", category: "Length", toBase: (v) => v, fromBase: (v) => v },
  { label: "Kilometers (km)", value: "km", category: "Length", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { label: "Centimeters (cm)", value: "cm", category: "Length", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  { label: "Millimeters (mm)", value: "mm", category: "Length", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { label: "Feet (ft)", value: "ft", category: "Length", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  { label: "Inches (in)", value: "in", category: "Length", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  // Mass (Base: Kilogram)
  { label: "Kilograms (kg)", value: "kg", category: "Mass", toBase: (v) => v, fromBase: (v) => v },
  { label: "Grams (g)", value: "g", category: "Mass", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { label: "Milligrams (mg)", value: "mg", category: "Mass", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
  { label: "Pounds (lb)", value: "lb", category: "Mass", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  // Time (Base: Second)
  { label: "Seconds (s)", value: "s", category: "Time", toBase: (v) => v, fromBase: (v) => v },
  { label: "Minutes (min)", value: "min", category: "Time", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
  { label: "Hours (hr)", value: "hr", category: "Time", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
];

const unitCategories: UnitCategory[] = ["Length", "Mass", "Time"];

export default function UnitConverterG11Page() {
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>("Length");
  const [fromUnit, setFromUnit] = useState<string>(units.find(u => u.category === "Length")?.value || "m");
  const [toUnit, setToUnit] = useState<string>(units.find(u => u.category === "Length" && u.value !== fromUnit)?.value || "ft");
  const [inputValue, setInputValue] = useState<string>("1");
  const [outputValue, setOutputValue] = useState<string>("");

  const availableUnits = useMemo(() => units.filter(u => u.category === selectedCategory), [selectedCategory]);

  const handleCategoryChange = (category: UnitCategory) => {
    setSelectedCategory(category);
    const defaultFromUnit = units.find(u => u.category === category)?.value || "";
    const defaultToUnit = units.find(u => u.category === category && u.value !== defaultFromUnit)?.value || "";
    setFromUnit(defaultFromUnit);
    setToUnit(defaultToUnit);
    setInputValue("1"); // Reset input value
    performConversion("1", defaultFromUnit, defaultToUnit);
  };

  const performConversion = (currentInput: string, currentFrom: string, currentTo: string) => {
    const val = parseFloat(currentInput);
    if (isNaN(val)) {
      setOutputValue("Invalid input");
      return;
    }

    const fromU = units.find(u => u.value === currentFrom);
    const toU = units.find(u => u.value === currentTo);

    if (fromU && toU && fromU.category === toU.category) {
      const baseValue = fromU.toBase(val);
      const finalValue = toU.fromBase(baseValue);
      setOutputValue(finalValue.toPrecision(5)); // Show with reasonable precision
    } else {
      setOutputValue("N/A");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    performConversion(e.target.value, fromUnit, toUnit);
  };

  const handleFromUnitChange = (value: string) => {
    setFromUnit(value);
    if (value === toUnit) { // Prevent from and to being the same, pick next available
      const nextUnit = availableUnits.find(u => u.value !== value)?.value || availableUnits[0]?.value;
      if (nextUnit) setToUnit(nextUnit);
      performConversion(inputValue, value, nextUnit || toUnit);
    } else {
      performConversion(inputValue, value, toUnit);
    }
  };
  
  const handleToUnitChange = (value: string) => {
    setToUnit(value);
     if (value === fromUnit) { // Prevent from and to being the same
      const nextUnit = availableUnits.find(u => u.value !== value)?.value || availableUnits[0]?.value;
      if (nextUnit) setFromUnit(nextUnit);
      performConversion(inputValue, nextUnit || fromUnit, value);
    } else {
      performConversion(inputValue, fromUnit, value);
    }
  };

  // Initial conversion on load
  useState(() => {
    performConversion(inputValue, fromUnit, toUnit);
  });

  const getCategoryIcon = (category: UnitCategory) => {
    switch(category) {
      case "Length": return <Ruler className="mr-2 h-4 w-4" />;
      case "Mass": return <Scale className="mr-2 h-4 w-4" />;
      case "Time": return <ClockIcon className="mr-2 h-4 w-4" />;
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/simulations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Simulations
        </Link>
      </Button>

      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">Unit Converter (Grade 11)</CardTitle>
              <CardDescription>
                Convert between common physics units.
              </CardDescription>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon"><HelpCircle className="h-5 w-5"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <h4 className="font-medium leading-none mb-2">How to Use</h4>
                    <p className="text-sm text-muted-foreground">
                        1. Select the quantity type (Length, Mass, Time).
                        <br/>2. Choose the unit to convert from.
                        <br/>3. Choose the unit to convert to.
                        <br/>4. Enter the value in the input field.
                        <br/>The result will update automatically.
                    </p>
                </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="category-select">Quantity Type</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Select quantity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Quantities</SelectLabel>
                  {unitCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center">
                        {getCategoryIcon(cat)} {cat}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="from-unit-select">From Unit</Label>
              <Select value={fromUnit} onValueChange={handleFromUnitChange} disabled={availableUnits.length === 0}>
                <SelectTrigger id="from-unit-select">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="to-unit-select">To Unit</Label>
              <Select value={toUnit} onValueChange={handleToUnitChange} disabled={availableUnits.length === 0}>
                <SelectTrigger id="to-unit-select">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="input-value">Input Value ({units.find(u=>u.value === fromUnit)?.label})</Label>
            <Input
              id="input-value"
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter value to convert"
            />
          </div>

          <div>
            <Label htmlFor="output-value">Converted Value ({units.find(u=>u.value === toUnit)?.label})</Label>
            <Input
              id="output-value"
              type="text"
              value={outputValue}
              readOnly
              className="font-semibold bg-muted"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
