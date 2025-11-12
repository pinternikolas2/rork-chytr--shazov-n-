import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Upload, Edit3, Check, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import type { MealType } from '@/constants/types';

const nutritionSchema = z.object({
  name: z.string().describe('Name of the food item'),
  calories: z.number().describe('Calories in kcal'),
  protein: z.number().describe('Protein in grams'),
  carbs: z.number().describe('Carbohydrates in grams'),
  fat: z.number().describe('Fat in grams'),
  sodium: z.number().describe('Sodium in milligrams'),
  fiber: z.number().optional().describe('Fiber in grams'),
  servingSize: z.string().optional().describe('Serving size description'),
});

type NutritionData = z.infer<typeof nutritionSchema>;

export default function AddMealScreen() {
  const { t, addMealLog, addCustomFood, settings } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'select' | 'camera' | 'edit'>('select');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sodium: 0,
    fiber: 0,
    servingSize: '',
  });
  const [mealType, setMealType] = useState<MealType>('snack');
  const [saveToCustom, setSaveToCustom] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleTakePhoto = async () => {
    if (!cameraPermission || !cameraPermission.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(t.common.error, t.nutrition.cameraPermissionRequired);
        return;
      }
    }
    setMode('camera');
  };

  const handleUploadPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setPhoto(base64);
      await analyzeFood(base64);
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });
      
      if (photo) {
        const base64 = photo.base64
          ? `data:image/jpeg;base64,${photo.base64}`
          : photo.uri;
        setPhoto(base64);
        setMode('edit');
        await analyzeFood(base64);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(t.common.error, t.nutrition.failedToCapture);
    }
  };

  const analyzeFood = async (imageUri: string) => {
    setIsAnalyzing(true);
    setMode('edit');
    
    try {
      const analyzePrompt = settings.language === 'cs' 
        ? 'Analyzuj tento obrázek jídla a poskytni podrobné nutriční informace. Pokud vidíš více položek, poskytni celkové hodnoty pro všechny položky dohromady. Buď co nejpřesnější s odhady. Název jídla musí být v češtině. Popis porce také v češtině.'
        : 'Analyze this food image and provide detailed nutrition information. If you see multiple items, provide total values for all items combined. Be as accurate as possible with estimates.';

      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analyzePrompt,
              },
              {
                type: 'image',
                image: imageUri,
              },
            ],
          },
        ],
        schema: nutritionSchema,
      });

      setNutritionData({
        ...result,
        fiber: result.fiber || 0,
        servingSize: result.servingSize || (settings.language === 'cs' ? '1 porce' : '1 serving'),
      });
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert(t.common.error, t.nutrition.failedToAnalyze);
      setNutritionData({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sodium: 0,
        fiber: 0,
        servingSize: settings.language === 'cs' ? '1 porce' : '1 serving',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntry = () => {
    setMode('edit');
    setPhoto(null);
  };

  const handleSave = async () => {
    if (!nutritionData.name.trim()) {
      Alert.alert(t.common.error, t.nutrition.enterFoodName);
      return;
    }

    if (nutritionData.calories <= 0) {
      Alert.alert(t.common.error, t.nutrition.enterValidCalories);
      return;
    }

    try {
      let customFoodId: string | undefined;

      if (saveToCustom) {
        const customFood = await addCustomFood({
          name: nutritionData.name,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat,
          sodiumMg: nutritionData.sodium,
          fiber: nutritionData.fiber,
          servingSize: nutritionData.servingSize,
          imageUri: photo || undefined,
        });
        customFoodId = customFood.id;
      }

      await addMealLog({
        date: new Date(),
        name: nutritionData.name,
        mealType,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        sodiumMg: nutritionData.sodium,
        fiber: nutritionData.fiber,
        imageUri: photo || undefined,
        customFoodId,
      });

      router.back();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(t.common.error, t.nutrition.failedToSave);
    }
  };

  if (mode === 'camera') {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.cameraOverlay}>
            <Pressable style={styles.closeButton} onPress={() => setMode('select')}>
              <X size={24} color={Colors.white} />
            </Pressable>
            <View style={styles.cameraControls}>
              <Pressable style={styles.captureButton} onPress={capturePhoto}>
                <View style={styles.captureButtonInner} />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (mode === 'edit') {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.nutrition.addFood}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {photo && photo.trim() !== '' && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => setPhoto(null)}
              >
                <X size={16} color={Colors.white} />
              </Pressable>
            </View>
          )}

          {isAnalyzing && (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={Colors.gold} />
              <Text style={styles.analyzingText}>{t.nutrition.analyzing}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.nutrition.mealType}</Text>
            <View style={styles.mealTypeGrid}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    mealType === type && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Text
                    style={[
                      styles.mealTypeButtonText,
                      mealType === type && styles.mealTypeButtonTextActive,
                    ]}
                  >
                    {t.nutrition[type]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.nutrition.foodName}</Text>
            <TextInput
              style={styles.input}
              value={nutritionData.name}
              onChangeText={(text) =>
                setNutritionData({ ...nutritionData, name: text })
              }
              placeholder={settings.language === 'cs' ? 'např. Kuřecí prsa' : 'e.g., Chicken Breast'}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.nutrition.servingSize}</Text>
            <TextInput
              style={styles.input}
              value={nutritionData.servingSize}
              onChangeText={(text) =>
                setNutritionData({ ...nutritionData, servingSize: text })
              }
              placeholder={settings.language === 'cs' ? 'např. 100g' : 'e.g., 100g'}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.nutrition.nutritionFacts}</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t.nutrition.calories}</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={nutritionData.calories.toString()}
                  onChangeText={(text) =>
                    setNutritionData({
                      ...nutritionData,
                      calories: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.nutritionUnit}>{t.common.kcal}</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t.nutrition.protein}</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={nutritionData.protein.toString()}
                  onChangeText={(text) =>
                    setNutritionData({
                      ...nutritionData,
                      protein: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.nutritionUnit}>{t.common.g}</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t.nutrition.carbs}</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={nutritionData.carbs.toString()}
                  onChangeText={(text) =>
                    setNutritionData({
                      ...nutritionData,
                      carbs: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.nutritionUnit}>{t.common.g}</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t.nutrition.fat}</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={nutritionData.fat.toString()}
                  onChangeText={(text) =>
                    setNutritionData({ ...nutritionData, fat: parseFloat(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.nutritionUnit}>{t.common.g}</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t.nutrition.sodium}</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={nutritionData.sodium.toString()}
                  onChangeText={(text) =>
                    setNutritionData({
                      ...nutritionData,
                      sodium: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.nutritionUnit}>{t.common.mg}</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{t.nutrition.fiber}</Text>
                <TextInput
                  style={styles.nutritionInput}
                  value={nutritionData.fiber?.toString() || '0'}
                  onChangeText={(text) =>
                    setNutritionData({
                      ...nutritionData,
                      fiber: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textLight}
                />
                <Text style={styles.nutritionUnit}>{t.common.g}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.saveToCustomButton}
            onPress={() => setSaveToCustom(!saveToCustom)}
          >
            <View
              style={[
                styles.checkbox,
                saveToCustom && styles.checkboxActive,
              ]}
            >
              {saveToCustom && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.saveToCustomText}>{t.nutrition.saveToMyFoods}</Text>
          </Pressable>
        </ScrollView>

        <Pressable
          style={styles.floatingSaveButton}
          onPress={handleSave}
          disabled={isAnalyzing}
        >
          <Check size={24} color={Colors.black} />
          <Text style={styles.floatingSaveText}>{t.common.save}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.nutrition.addFood}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.selectContainer}>
        <Text style={styles.selectTitle}>{t.nutrition.addFood}</Text>

        <View style={styles.optionsContainer}>
          <Pressable style={styles.optionCard} onPress={handleTakePhoto}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.gold + '20' }]}>
              <Camera size={32} color={Colors.gold} />
            </View>
            <Text style={styles.optionTitle}>{t.nutrition.takePhoto}</Text>
            <Text style={styles.optionDescription}>
              {t.nutrition.scanFood}
            </Text>
          </Pressable>

          <Pressable style={styles.optionCard} onPress={handleUploadPhoto}>
            <View
              style={[
                styles.optionIcon,
                { backgroundColor: Colors.textSecondary + '20' },
              ]}
            >
              <Upload size={32} color={Colors.textSecondary} />
            </View>
            <Text style={styles.optionTitle}>{t.nutrition.uploadPhoto}</Text>
            <Text style={styles.optionDescription}>
              {t.nutrition.choosePhotoFromGallery}
            </Text>
          </Pressable>

          <Pressable style={styles.optionCard} onPress={handleManualEntry}>
            <View
              style={[
                styles.optionIcon,
                { backgroundColor: Colors.textPrimary + '20' },
              ]}
            >
              <Edit3 size={32} color={Colors.textPrimary} />
            </View>
            <Text style={styles.optionTitle}>{t.nutrition.manualEntry}</Text>
            <Text style={styles.optionDescription}>
              {t.nutrition.enterNutritionManually}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  selectContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  selectTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.gold,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gold,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    marginBottom: 24,
  },
  analyzingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '47%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: Colors.gold,
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  mealTypeButtonTextActive: {
    color: Colors.black,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  nutritionInput: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    padding: 0,
  },
  nutritionUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saveToCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.black,
  },
  saveToCustomText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  floatingSaveButton: {
    position: 'absolute' as const,
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingSaveText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
  },
});
