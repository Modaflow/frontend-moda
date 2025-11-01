"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const countries = [
  { code: "US", dialCode: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "CA", dialCode: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "AU", dialCode: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "IN", dialCode: "+91", flag: "🇮🇳", name: "India" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷", name: "France" },
  { code: "JP", dialCode: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "CN", dialCode: "+86", flag: "🇨🇳", name: "China" },
  { code: "BR", dialCode: "+55", flag: "🇧🇷", name: "Brazil" },
];

export function PhoneInput({
  value,
  onChange,
  disabled,
  className,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // Detect country from existing phone number
  useEffect(() => {
    if (value) {
      for (const country of countries) {
        if (value.startsWith(country.dialCode)) {
          setSelectedCountry(country);
          break;
        }
      }
    }
  }, []);

  // Extract phone number without country code
  const getPhoneWithoutCode = (fullPhone: string) => {
    if (!fullPhone) return "";
    // Remove any country code prefix
    for (const country of countries) {
      if (fullPhone.startsWith(country.dialCode)) {
        return fullPhone.slice(country.dialCode.length).trim();
      }
    }
    return fullPhone;
  };

  const phoneNumber = getPhoneWithoutCode(value);

  // Format phone number for display (XXX) XXX-XXXX
  const formatPhoneForDisplay = (phone: string) => {
    const digits = phone.replace(/[^\d]/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const displayPhone = formatPhoneForDisplay(phoneNumber);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value.replace(/[^\d]/g, ""); // Only digits
    onChange(`${selectedCountry.dialCode}${newPhone}`);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      const currentPhone = getPhoneWithoutCode(value);
      onChange(`${country.dialCode}${currentPhone}`);
    }
  };

  return (
    <div
      className={`flex items-center border border-gray-200 rounded-xl h-12 bg-white overflow-hidden ${
        className || ""
      }`}
    >
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[80px] h-full border-0 rounded-none border-r border-gray-200 bg-transparent hover:bg-gray-50 focus:ring-0 focus:ring-offset-0">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl leading-none">
              {selectedCountry.flag}
            </span>
            {/* <ChevronDown className="h-4 w-4 text-gray-400" /> */}
          </div>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
                <span className="text-sm text-gray-500">
                  {country.dialCode}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center flex-1 px-3 gap-2">
        <span className="text-gray-600 font-medium text-sm">
          {selectedCountry.dialCode}
        </span>
        <Input
          type="tel"
          value={displayPhone}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder="(XXX) XXX-XXXX"
          className="flex-1 h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
      </div>
    </div>
  );
}
