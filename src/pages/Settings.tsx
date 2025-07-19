import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  Store,
  Printer,
  Palette,
  Bell,
  Currency,
  Save,
  RotateCcw
} from "lucide-react";

const settingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessPhone: z.string().min(1, "Business phone is required"),
  businessEmail: z.string().email("Valid email is required"),
  currency: z.string().min(1, "Currency is required"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0-100"),
  lowStockThreshold: z.number().min(1, "Low stock threshold must be at least 1"),
  voucherPrefix: z.string().min(1, "Voucher prefix is required"),
  printerType: z.enum(['thermal', 'inkjet', 'laser']),
  paperSize: z.enum(['A4', 'A5', 'A6', 'receipt']),
  autoBackup: z.boolean(),
  showLowStockAlerts: z.boolean(),
  darkMode: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface AppSettings extends SettingsForm {
  lastUpdated: string;
}

const defaultSettings: AppSettings = {
  businessName: "My POS Store",
  businessAddress: "123 Main Street, City, Country",
  businessPhone: "+95 9 123 456 789",
  businessEmail: "store@example.com",
  currency: "MMK",
  taxRate: 0,
  lowStockThreshold: 5,
  voucherPrefix: "V",
  printerType: "thermal",
  paperSize: "receipt",
  autoBackup: false,
  showLowStockAlerts: true,
  darkMode: false,
  lastUpdated: new Date().toISOString(),
};

export default function Settings() {
  const { toast } = useToast();
  const [isDirty, setIsDirty] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  const watchedValues = watch();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('pos_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      Object.keys(settings).forEach(key => {
        if (key !== 'lastUpdated') {
          setValue(key as keyof SettingsForm, settings[key]);
        }
      });
    }
  }, [setValue]);

  useEffect(() => {
    // Mark as dirty when values change
    setIsDirty(true);
  }, [watchedValues]);

  const onSubmit = (data: SettingsForm) => {
    try {
      const settings: AppSettings = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem('pos_settings', JSON.stringify(settings));
      setIsDirty(false);

      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values?")) {
      reset(defaultSettings);
      localStorage.removeItem('pos_settings');
      setIsDirty(false);
      
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values",
      });
    }
  };

  const currencies = [
    { value: "MMK", label: "Myanmar Kyat (MMK)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "THB", label: "Thai Baht (THB)" },
    { value: "SGD", label: "Singapore Dollar (SGD)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your POS system preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="mr-2 h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  {...register("businessName")}
                  placeholder="Enter business name"
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive mt-1">{errors.businessName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  {...register("businessPhone")}
                  placeholder="Enter phone number"
                />
                {errors.businessPhone && (
                  <p className="text-sm text-destructive mt-1">{errors.businessPhone.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea
                id="businessAddress"
                {...register("businessAddress")}
                placeholder="Enter complete business address"
                rows={3}
              />
              {errors.businessAddress && (
                <p className="text-sm text-destructive mt-1">{errors.businessAddress.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                type="email"
                {...register("businessEmail")}
                placeholder="Enter business email"
              />
              {errors.businessEmail && (
                <p className="text-sm text-destructive mt-1">{errors.businessEmail.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Currency className="mr-2 h-5 w-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select onValueChange={(value) => setValue("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-destructive mt-1">{errors.currency.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  {...register("taxRate", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.taxRate && (
                  <p className="text-sm text-destructive mt-1">{errors.taxRate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Inventory & Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                {...register("lowStockThreshold", { valueAsNumber: true })}
                placeholder="5"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Products with quantity below this number will be marked as low stock
              </p>
              {errors.lowStockThreshold && (
                <p className="text-sm text-destructive mt-1">{errors.lowStockThreshold.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showLowStockAlerts">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications when products are running low
                </p>
              </div>
              <Switch
                id="showLowStockAlerts"
                checked={watchedValues.showLowStockAlerts}
                onCheckedChange={(checked) => setValue("showLowStockAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Voucher Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5" />
              Voucher Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="voucherPrefix">Voucher Number Prefix</Label>
              <Input
                id="voucherPrefix"
                {...register("voucherPrefix")}
                placeholder="V"
                maxLength={3}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Example: V20241219001, INV20241219001
              </p>
              {errors.voucherPrefix && (
                <p className="text-sm text-destructive mt-1">{errors.voucherPrefix.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Printer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Printer className="mr-2 h-5 w-5" />
              Printer Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="printerType">Printer Type</Label>
                <Select onValueChange={(value: 'thermal' | 'inkjet' | 'laser') => setValue("printerType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select printer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thermal">Thermal Printer</SelectItem>
                    <SelectItem value="inkjet">Inkjet Printer</SelectItem>
                    <SelectItem value="laser">Laser Printer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.printerType && (
                  <p className="text-sm text-destructive mt-1">{errors.printerType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="paperSize">Paper Size</Label>
                <Select onValueChange={(value: 'A4' | 'A5' | 'A6' | 'receipt') => setValue("paperSize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
                    <SelectItem value="A6">A6 (105 × 148 mm)</SelectItem>
                    <SelectItem value="receipt">Receipt (80mm)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paperSize && (
                  <p className="text-sm text-destructive mt-1">{errors.paperSize.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Automatic Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create daily backups of your data
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={watchedValues.autoBackup}
                onCheckedChange={(checked) => setValue("autoBackup", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the interface
                </p>
              </div>
              <Switch
                id="darkMode"
                checked={watchedValues.darkMode}
                onCheckedChange={(checked) => setValue("darkMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={!isDirty}
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}