// src/data/grade9/g9-u1-data.ts
import type { UnitData, MCQ, QuestionAnswer, PdfResource } from '@/lib/types'; // Make sure path is correct

export const grade9Unit1Data: UnitData = {
  unitId: "g9-u1",
  unitName: "Unit 1: Physical Quantities and Measurement",
  gradeId: "grade9",
  gradeName: "Grade IX",
  sectionName: "Section 1: General Physics",

  summary: `This unit introduces the fundamental concepts of physics, focusing on what physical quantities are, how they are measured, and the standardized units (SI units) used globally. It distinguishes between base and derived quantities. Key tools for measurement like the Meter Rule, Vernier Calipers, and Micrometer Screw Gauge are discussed, along with the importance of scientific notation and significant figures for precision. The concepts of volume and density, and methods for their determination, are also covered as foundational aspects of physical measurement. [cite: 5413, 5414, 5415]`,

  keyPoints: [
    "Physics is the branch of science dealing with matter, energy, and their interaction. [cite: 1928, 1929, 1930, 1938, 1955]",
    "Physical quantities are measurable properties; classified as base (e.g., length, mass, time) and derived (e.g., velocity, density). [cite: 1957, 1959, 1960, 1966, 2133]",
    "The International System of Units (SI) provides standard units: meter (m) for length, kilogram (kg) for mass, second (s) for time. [cite: 1982, 2010, 2028]",
    "Prefixes (kilo, milli, micro, etc.) modify SI units for larger or smaller magnitudes. [cite: 2050, 2051, 2052, 2053, 2130]",
    "Scientific notation expresses very large or small numbers conveniently (e.g., $$3 \\times 10^8 \\text{ m/s}$$). [cite: 2058, 2059, 2060, 2125]",
    "Significant figures indicate the precision of a measurement, including all certain digits and one estimated digit. [cite: 2117, 2128, 2131]",
    "Meter Rule: Least count typically 1 mm or 0.1 cm. [cite: 1988, 1989, 1990]",
    "Vernier Calipers: Least count typically 0.1 mm or 0.01 cm; used for precise length/diameter measurements. [cite: 1991, 1992, 1993, 1994, 1995, 1996]",
    "Micrometer Screw Gauge: Least count typically 0.01 mm or 0.001 cm; for very small dimensions. [cite: 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010]",
    "Physical Balance: Used for accurate mass measurement. [cite: 2015, 2016, 2017, 2018, 2019, 2020, 2021]",
    "Stopwatch (Mechanical/Digital): Measures time intervals; digital offers higher precision (e.g., 0.01s). [cite: 2029, 2030, 2031, 2032, 2036, 2037, 2038, 2039]",
    "Measuring Cylinder: Used to measure the volume of liquids and irregular solids (by displacement). [cite: 1991, 1992, 1993, 1994, 1995, 2081, 2082, 2083, 2084, 2085, 2087, 2088, 2089, 2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101, 2126, 2127]",
    "Density ($\\rho$) is mass per unit volume ($$\\rho = \\frac{m}{V}$$), SI unit: kg/m³. [cite: 2107, 2108, 2110, 2128, 2129]"
  ],

  mcqs: [
    // From PhyicsG9Ch1.pdf - End of Unit Questions (MCQs start page 26, but Q6 onwards match pg 31 of your provided PDF)
    {
      id: "g9u1mcq1_vernier_reading", // Based on Q1, pg 30
      question: "The Figure 1.26 shows part of a Vernier scale, what is the reading on the Vernier scale",
      options: ["6.50cm", "6.55cm", "7.00cm", "7.45cm"],
      correctAnswerIndex: 1, // Main scale reading is 6.5 cm, Vernier scale reading is 5th division coinciding, so 0.05 cm. Total = 6.5 + 0.05 = 6.55 cm.
      explanation: "The main scale reading is 6.5 cm (the line before the zero mark of the Vernier scale). The 5th division on the Vernier scale coincides with a main scale division. Assuming a least count of 0.01 cm, the Vernier reading is 5 * 0.01 cm = 0.05 cm. Therefore, the total reading is 6.5 cm + 0.05 cm = 6.55 cm. [cite: 2137]"
    },
    {
      id: "g9u1mcq2_steel_density", // Based on Q2, pg 30
      question: "Ten identical steel balls each of mass 27g, are immersed in a measuring cylinder having 20cm³ of water. The reading of water level rises to 50cm³. What is the density of the steel?",
      options: ["0.90 gm/cm³", "8.1 gm/cm³", "9.0gm/cm³", "13.5gm/cm³"],
      correctAnswerIndex: 2,
      explanation: "The total mass of 10 steel balls is 10 * 27g = 270g. The volume of water displaced (which is the volume of the steel balls) is 50cm³ - 20cm³ = 30cm³. Density = Mass / Volume = 270g / 30cm³ = 9.0 gm/cm³. [cite: 2138, 2139, 2140]"
    },
    {
      id: "g9u1mcq3_object_density", // Based on Q3, pg 30
      question: "An object of mass 100g is immersed in water as shown in the figure 1.27, what is the density of the material from which object is made?",
      options: ["0.4gcm³", "0.9gcm³", "1.1gcm³", "2.5gcm³"],
      correctAnswerIndex: 2,
      explanation: "From the figure, the initial water level is 90 cm³ and the final water level with the object immersed is 180 cm³. So the volume of the object is 180 cm³ - 90 cm³ = 90 cm³. The mass of the object is 100g. Density = Mass / Volume = 100g / 90cm³ ≈ 1.11 gcm³. Rounding to one decimal place, the density is 1.1 gcm³. [cite: 2151, 2152, 2153]"
    },
    {
      id: "g9u1mcq4_micrometer_reading", // Based on Q4, pg 30
      question: "What is the reading of this micrometer in figure 1.28",
      options: ["5.43mm", "6.63mm", "7.30mm", "8.13mm"],
      correctAnswerIndex: 1, // Main scale reading is 6.5 mm (6mm + 0.5mm mark visible). Thimble scale reading is 13 divisions * 0.01mm = 0.13mm. Total = 6.5 + 0.13 = 6.63 mm.
      explanation: "The main scale reading is 6.5 mm (the 6 mm mark is visible, and the 0.5 mm mark below the main line is also visible). The thimble scale reading is 13 divisions (the 10th mark plus 3 more divisions) which, multiplied by the least count of 0.01 mm, gives 0.13 mm. Total reading = 6.5 mm + 0.13 mm = 6.63 mm. [cite: 2147]"
    },
    {
      id: "g9u1mcq5_chips_wrapper_area", // Based on Q5, pg 30
      question: "A chips wrapper is 4.5 cm long and 5.9 cm wide. Its area up to significant figures will be",
      options: ["30cm²", "28 cm²", "26.55cm²", "32 cm²"],
      correctAnswerIndex: 0,
      explanation: "Area = length * width = 4.5 cm * 5.9 cm = 26.55 cm². When multiplying, the result should have the same number of significant figures as the measurement with the fewest significant figures. Both 4.5 cm and 5.9 cm have two significant figures. Therefore, 26.55 cm² should be rounded to two significant figures, which is 27 cm². However, among the given options, '30cm²' is the closest if rounding to one significant figure for the tens digit (which is less precise). If strictly following the rule for two significant figures, the answer would be 27 cm². Since 27 is not an option, and 30 is given as an option implying rounding to the nearest ten or perhaps a less strict application of significant figures in multiplication, it's the best fit among the choices. If we assume the question implies rounding to the nearest 10, then 26.55 rounds to 30. [cite: 2148]"
    },
    {
      id: "g9u1mcq6_worldwide_measurements_system", // Based on Q6, pg 31
      question: "A worldwide system of measurements in which the units of base quantities were introduced is called",
      options: ["prefixes", "international system of units", "hexadecimal system", "none of above"],
      correctAnswerIndex: 1,
      explanation: "The International System of Units (SI) is the globally accepted system for measurements. [cite: 2153]"
    },
    {
      id: "g9u1mcq7_accurately_known_digits", // Based on Q7, pg 31
      question: "All accurately known digits and first doubtful digit in an expression are known as",
      options: ["non-significant figures", "significant figures", "estimated figures", "crossed figures"],
      correctAnswerIndex: 1,
      explanation: "Significant figures represent the precision of a measurement, including all certain digits and one uncertain digit. [cite: 2157]"
    },
    {
      id: "g9u1mcq8_vernier_zero_error", // Based on Q8, pg 31
      question: "If zero line of Vernier scale coincides with zero of main scale, then zero error is",
      options: ["positive", "zero", "negative", "one"],
      correctAnswerIndex: 1,
      explanation: "When the zeros of both scales align perfectly with jaws closed, there is no zero error. [cite: 2153]"
    },
    {
      id: "g9u1mcq9_instrument_zero_error", // Based on Q9, pg 31
      question: "Zero error of the instrument is",
      options: ["systematic error", "human error", "random error", "classified error"],
      correctAnswerIndex: 0,
      explanation: "Zero error is a type of systematic error, as it consistently affects measurements in the same way. [cite: 2154]"
    },
    {
      id: "g9u1mcq10_base_quantities", // Based on Q10, pg 31
      question: "Length, mass, electric current, time, intensity of light and amount of substance are examples of",
      options: ["base quantities", "derived quantities", "prefixes", "quartile quantities"],
      correctAnswerIndex: 0,
      explanation: "These are the seven fundamental or base quantities in the SI system. [cite: 2154]"
    }
  ],

  conceptualQuestions: [ // From "Structured Questions" (pg 32-33) & "Self Assessment" (pg 27)
    {
      id: "g9u1crq1_height_instrument", // Based on Self Assessment Q1, pg 19
      question: "What instrument will you choose to measure height of your friend?",
      answer_guideline: "A measuring tape (or meter rule held vertically, though tape is more convenient for height) would be appropriate. Ensure the tape is held straight and perpendicular to the ground, starting from the base of the feet to the top of the head. Read the measurement at eye level to avoid parallax error. [cite: 2045]"
    },
    {
      id: "g9u1crq2_mass_instrument", // Based on Self Assessment Q3, pg 19
      question: "Which instrument will you choose to measure your mass?",
      answer_guideline: "To measure mass accurately, a physical balance (like a beam balance or a calibrated digital scale that measures mass) is used. A spring balance measures weight, which can vary with location, though it's often calibrated to show mass. [cite: 2047, 2124]"
    },
    {
      id: "g9u1crq3_prefix_conversion", // Based on Structured Q6, pg 33
      question: "Write the correct prefix of notion \na) 75000m = 750 __ \nb) 2/1000 sec. If this is 1 ___, what is the unit? (Interpret as 0.001 s = 1 ___) \nc) 1/1000000 g = 1 __ \nd) 1000000000 m = 1 __",
      answer_guideline: "a) 75000 m = 750 **hm** (hectometers). More commonly: 75 **km** (kilometers). [cite: 2160] \nb) If 0.001 s = 1 unit, then the unit is **ms** (millisecond). [cite: 2160] \nc) 1/1000000 g = 1 **µg** (microgram). [cite: 2160] \nd) 1000000000 m = 1 **Gm** (gigameter). [cite: 2160]"
    },
    {
      id: "g9u1crq4_sigfigs_determination", // Based on Self Assessment Q7, pg 27
      question: "Determine the number of significant figures in 00.6022009",
      answer_guideline: "The number is 00.6022009. \n- Leading zeros (before '6') are not significant. \n- '6', '2', '2', '9' are non-zero digits, so they are significant (4 digits). \n- Zeros between non-zero digits ('0' between 6 and 2) are significant (1 digit). \n- Trailing zeros in the decimal part ('00' after 22) are significant if they indicate precision (2 digits). \nTotal significant figures = 4 (non-zero) + 1 (zero between non-zero) + 2 (trailing decimal zeros) = **7 significant figures** (6, 0, 2, 2, 0, 0, 9). [cite: 2122]"
    },
    {
      id: "g9u1crq5_denser_gas", // Based on Self Assessment Q5, pg 25
      question: "How can you identify which gas is denser among the gases?",
      answer_guideline: "To identify which gas is denser, you would typically compare their densities at the same temperature and pressure. The gas with the higher density value (mass per unit volume) would be considered denser. This can be done by measuring the mass of a known volume of each gas. [cite: 2115]"
    },
    {
      id: "g9u1crq6_hot_air_balloon", // Based on Self Assessment Q6, pg 25
      question: "Can you tell how hot air balloon works?",
      answer_guideline: "A hot air balloon works based on the principle of buoyancy and density. The air inside the balloon is heated, making it less dense than the cooler air outside the balloon. Because the hot air is lighter than the surrounding cooler air, the balloon experiences an upward buoyant force, causing it to rise. [cite: 2115]"
    },
    {
      id: "g9u1crq7_seconds_in_a_year", // Based on Self Assessment Q2, pg 19
      question: "Can you describe how many seconds are there in a year?",
      answer_guideline: "To calculate the number of seconds in a year:\n1 year = 365 days (approximately, ignoring leap years for simplicity)\n1 day = 24 hours\n1 hour = 60 minutes\n1 minute = 60 seconds\nSo, 1 year = 365 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute = **31,536,000 seconds**. [cite: 2046]"
    }
  ],

  extendedResponseQuestions: [
    // From "Structured Questions" (pg 32-33)
    {
      id: "g9u1erq1_column_match", // Based on Structured Q1, pg 32
      question: "Match Column A (Action) with Column B (Branch of Physics):\n**Column A:**\n1. Cooking Bar B.Q\n2. Turning the Bulb on\n3. Riding a bicycle\n4. Looking for Giant Galaxies\n5. Producing a loud sound\n6. Describing an atom\n7. Obtaining energy from Earth\n\n**Column B:**\n* Thermodynamics\n* Electricity\n* Mechanics\n* Astrophysics\n* Sound\n* Atomic Physics\n* Geophysics",
      answer_guideline: "**Matching:**\n1. Cooking Bar B.Q - **Thermodynamics** [cite: 1940, 2155]\n2. Turning the Bulb on - **Electricity** [cite: 1941, 2155]\n3. Riding a bicycle - **Mechanics** [cite: 1939, 2155]\n4. Looking for Giant Galaxies - **Astrophysics** [cite: 1946, 2155]\n5. Producing a loud sound - **Sound** [cite: 1943, 2155]\n6. Describing an atom - **Atomic Physics** [cite: 1942, 2155]\n7. Obtaining energy from Earth - **Geophysics** [cite: 1948, 2155]"
    },
    {
      id: "g9u1erq2_physical_quantity_table", // Based on Structured Q2, pg 32
      question: "Complete the following table:\n\n| Physical Quantity | S.I Unit | Type |\n|-------------------|----------|------|\n| Ampere            |          |      |\n|                   | m        |      |\n|                   | Sec      | Base |\n| Temperature       |          | Base |\n|                   | N        |      |\n| Density           | Kg per m³|      |\n| Acceleration      |          |      |",
      answer_guideline: "**Completed Table:**\n\n| Physical Quantity | S.I Unit | Type |\n|-------------------|----------|------|\n| Ampere            | **A** | **Base** |\n| **Length** | m        | **Base** |\n| **Time** | Sec      | Base |\n| Temperature       | **K** | Base |\n| **Force** | N        | **Derived** |\n| Density           | Kg per m³| **Derived** |\n| Acceleration      | **m/s²** | **Derived** |\n\n**Justification:**\n* Ampere (A) is the SI unit for Electric Current, which is a Base Quantity. [cite: 1962]\n* Meter (m) is the SI unit for Length, a Base Quantity. [cite: 1962]\n* Second (Sec or s) is the SI unit for Time, a Base Quantity. [cite: 1962]\n* Kelvin (K) is the SI unit for Temperature, a Base Quantity. [cite: 1962]\n* Newton (N) is the SI unit for Force, which is a Derived Quantity. [cite: 1967]\n* Kilogram per cubic meter (Kg/m³) is the SI unit for Density, a Derived Quantity. [cite: 1967]\n* Meter per second square (m/s²) is the SI unit for Acceleration, a Derived Quantity. [cite: 1967]"
    },
    {
      id: "g9u1erq3_unit_conversions", // Based on Structured Q3, pg 32
      question: "Convert the following values.\na) 230cm = ___ m\nb) 250 g = ___ kg\nc) 0.5s = ___ ms\nd) 0.8m = ___ mm\ne) 350ms = ___ S\nf) 1.2Kg = ___ g",
      answer_guideline: "a) 230 cm = 2.30 m (Since 1 m = 100 cm, divide cm by 100) [cite: 1985]\nb) 250 g = 0.250 kg (Since 1 kg = 1000 g, divide g by 1000) [cite: 2013]\nc) 0.5 s = 500 ms (Since 1 s = 1000 ms, multiply s by 1000) [cite: 2055]\nd) 0.8 m = 800 mm (Since 1 m = 1000 mm, multiply m by 1000) [cite: 1985]\ne) 350 ms = 0.350 S (Since 1 s = 1000 ms, divide ms by 1000) [cite: 2055]\nf) 1.2 Kg = 1200 g (Since 1 kg = 1000 g, multiply Kg by 1000) [cite: 2013]"
    },
    {
      id: "g9u1erq4_vernier_measurement", // Based on Structured Q4, pg 33
      question: "An engineer measures the width of an aluminum sheet using Vernier caliper as shown in fig 1.29 \na) What is the measurement of the width of aluminum sheet \nb) Which gives more precise measurement: Vernier caliper, Screw Gauge or meter rule?",
      answer_guideline: "a) **Measurement of the width of aluminum sheet (Fig 1.29):**\n   - Main scale reading: The zero of the Vernier scale is past the 4 mm mark but before the 5 mm mark. So, the main scale reading is 4 mm. \n   - Vernier scale reading: Look for the Vernier scale division that coincides perfectly with any main scale division. In the figure, the 5th division of the Vernier scale appears to coincide. Assuming a least count of 0.1 mm (common for Vernier calipers), the Vernier scale reading is 5 * 0.1 mm = 0.5 mm.\n   - Total reading = Main scale reading + Vernier scale reading = 4 mm + 0.5 mm = **4.5 mm**. [cite: 2149]\nb) **Precision comparison:** \n   - **Screw Gauge** gives the most precise measurement. \n   - Following that, the **Vernier caliper** provides more precision than a meter rule. \n   - The **meter rule** is the least precise of the three. \nThis is because the least count of a screw gauge (typically 0.01 mm) is smaller than that of a Vernier caliper (typically 0.1 mm), which in turn is smaller than that of a meter rule (typically 1 mm). [cite: 1988, 1991, 1999, 2000, 2001, 2150]"
    },
    {
      id: "g9u1erq5_pendulum_time_measurement", // Based on Structured Q5, pg 33
      question: "A pendulum swings as shown in figure 1.30 from X to Y and back to X again \ni) What would be the most accurate way of measuring time for one oscillation? with the help of a Stop Watch. \n   a) Record time for 10 oscillations and multiply by 10 \n   b) Record time for 10 oscillation and divide by 10 \n   c) Record time for one oscillation \n   d) Record time from X to Y and double it \nii) Suggest an instrument for measuring time period more accurately.",
      answer_guideline: "i) The most accurate way of measuring time for one oscillation with a stop watch is **b) Record time for 10 oscillations and divide by 10**. This method minimizes the human reaction time (random error) and other errors by averaging over multiple oscillations. [cite: 2151, 2152, 2153]\nii) For more accurate measurement of time period, an instrument like a **light gate (connected to a timer)** can be suggested. Light gates eliminate human reaction time errors, providing highly precise measurements, especially for short time intervals. [cite: 2043, 2044]"
    },
    {
      id: "g9u1erq6_density_volume_wooden_piece", // Based on Structured Q8, pg 34
      question: "A wooden piece is made in different shapes, take length (l) = radius (r) = 2m. Calculate its volume as a:\na) Sphere\nb) Cube\nc) Cylinder\nd) Pyramid\ne) Cylinder (This is a repeat, likely an error in the original question)",
      answer_guideline: "Let's calculate the volume for each shape with the given dimension (l=2m, r=2m):\n\na) **Sphere:**\n   - Formula for volume of a sphere: $$V = \\frac{4}{3} \\pi r^3$$\n   - Given r = 2m\n   - Calculation: $$V = \\frac{4}{3} \\times 3.14159 \\times (2m)^3 = \\frac{4}{3} \\times 3.14159 \\times 8m^3 \\approx 33.51 m^3$$\n\nb) **Cube:**\n   - Formula for volume of a cube: $$V = l^3$$\n   - Given l = 2m\n   - Calculation: $$V = (2m)^3 = 8m^3$$\n\nc) **Cylinder:** (Assuming height h = length l = 2m, and radius r = 2m)\n   - Formula for volume of a cylinder: $$V = \\pi r^2 h$$\n   - Given r = 2m, h = 2m\n   - Calculation: $$V = 3.14159 \\times (2m)^2 \\times 2m = 3.14159 \\times 4m^2 \\times 2m \\approx 25.13 m^3$$\n\nd) **Pyramid:** (Assuming a square base with side length l = 2m, and height h = l = 2m)\n   - Formula for volume of a pyramid: $$V = \\frac{1}{3} \\times \\text{base area} \\times h$$\n   - Base area (square) = $$l^2 = (2m)^2 = 4m^2$$\n   - Given h = 2m\n   - Calculation: $$V = \\frac{1}{3} \\times 4m^2 \\times 2m = \\frac{8}{3} m^3 \\approx 2.67 m^3$$"
    },
    {
      id: "g9u1erq7_density_change_with_shape", // Based on Structured Q9, pg 34
      question: "Find the density of wood as sphere and cube if the mass of wood is 1kg. Is there any change in density due to shape?",
      answer_guideline: "Given mass (m) = 1 kg. From the previous question, we have volumes for a sphere and a cube with specific dimensions.\n\n**For the Sphere (r=2m):**\n   - Volume $$V_{sphere} \\approx 33.51 m^3$$\n   - Density $$\\rho_{sphere} = \\frac{m}{V_{sphere}} = \\frac{1 kg}{33.51 m^3} \\approx 0.0298 kg/m^3$$\n\n**For the Cube (l=2m):**\n   - Volume $$V_{cube} = 8 m^3$$\n   - Density $$\\rho_{cube} = \\frac{m}{V_{cube}} = \\frac{1 kg}{8 m^3} = 0.125 kg/m^3$$\n\n**Is there any change in density due to shape?**\nYes, the calculated densities are different ($0.0298 kg/m^3$ for the sphere vs $0.125 kg/m^3$ for the cube). This is because the problem defined 'length (l) = radius (r) = 2m' for calculating the *volume* of different shapes. If a *specific piece of wood* with a fixed mass and volume were reshaped, its *density would not change*. However, here, by fixing a dimension (length/radius) to 2m for *different geometric shapes*, we are effectively talking about different pieces of wood with different volumes, even if their mass is 1kg. Therefore, the density changes because the *volume* changes for a fixed mass. [cite: 2107, 2108, 2109, 2110]"
    },
    {
      id: "g9u1erq8_measuring_cylinder_stone", // Based on Structured Q10, pg 34
      question: "A measuring cylinder (fig 1.31) is filled with 500cc water. A stone of mass 20g is immersed into the cylinder such that water level rises up to 800cc. Which statement is correct?\na) The difference between the readings gives the density of stone.\nb) The difference between the readings gives volume of the stone\nc) The final reading gives the density of stone\nd) The final reading gives the volume of stone",
      answer_guideline: "The correct statement is **b) The difference between the readings gives volume of the stone**. [cite: 2156]\n\n**Explanation:**\n- When an irregular solid is immersed in a liquid within a measuring cylinder, the volume of water displaced is equal to the volume of the irregular solid. [cite: 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101]\n- The initial reading was 500cc. The final reading after immersing the stone is 800cc. Therefore, the volume of the stone is the difference: 800cc - 500cc = 300cc. This method directly measures the volume of the irregular solid. [cite: 2155, 2156]\n- Density is mass per unit volume ($$\\rho = m/V$$), so simply taking the difference in volume or the final reading does not give the density directly without also knowing the mass. [cite: 2107, 2108]"
    },
    {
      id: "g9u1erq9_scientific_notation_conversion", // Based on Structured Q7, pg 33
      question: "Write values in standard and scientific notation \na) The radius of 1st orbit of Hydrogen atom is r = 0.53 A° = \nb) 1 light year is 2628000000000m = \nc) Vacuum pressure 2.7x10⁴ torr =",
      answer_guideline: "a) **Radius of 1st orbit of Hydrogen atom is r = 0.53 A°**\n   - **Standard Notation
    },