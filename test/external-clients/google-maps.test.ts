import { describe, it } from 'std/testing/bdd.ts'
import { getAddressFromData } from '../../external-clients/google-maps.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe('external-clients/google-maps.ts', () => {
  it('ok', () => {
    const results = [
      {
        address_components: [
          {
            long_name: 'Mankweng Hospital Heliport to bp karage',
            short_name: 'Mankweng Hospital Heliport to bp karage',
            types: ['airport', 'establishment', 'point_of_interest'],
          },
          {
            long_name: 'University Road',
            short_name: 'University Rd',
            types: ['route'],
          },
          {
            long_name: 'Mankweng-A',
            short_name: 'Mankweng-A',
            types: ['political', 'sublocality', 'sublocality_level_1'],
          },
          {
            long_name: 'Mankweng',
            short_name: 'Mankweng',
            types: ['locality', 'political'],
          },
          {
            long_name: 'Capricorn District Municipality',
            short_name: 'Capricorn District Municipality',
            types: ['administrative_area_level_2', 'political'],
          },
          {
            long_name: 'Limpopo',
            short_name: 'LP',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'South Africa',
            short_name: 'ZA',
            types: ['country', 'political'],
          },
          {
            long_name: '0727',
            short_name: '0727',
            types: ['postal_code'],
          },
        ],
        formatted_address: 'Mankweng Hospital Heliport to bp karage, University Rd, Mankweng-A, Mankweng, 0727, South Africa',
        geometry: {
          location: { lat: -23.8800338, lng: 29.726775 },
          location_type: 'GEOMETRIC_CENTER',
          viewport: {
            northeast: { lat: -23.8786848197085, lng: 29.7281239802915 },
            southwest: { lat: -23.8813827802915, lng: 29.7254260197085 },
          },
        },
        navigation_points: [
          {
            location: { latitude: -23.8809815, longitude: 29.7264345 },
            restricted_travel_modes: ['WALK'],
          },
          {
            location: { latitude: -23.8799169, longitude: 29.7258084 },
            restricted_travel_modes: ['DRIVE'],
          },
        ],
        place_id: 'ChIJ6e1LnUHJxh4RBssVgdATW-A',
        plus_code: {
          compound_code: '4P9G+XP Mankweng, South Africa',
          global_code: '5G8F4P9G+XP',
        },
        types: ['airport', 'establishment', 'point_of_interest'],
      },
      {
        address_components: [
          {
            long_name: 'Grace Mamabolo Street',
            short_name: 'Grace Mamabolo St',
            types: ['route'],
          },
          {
            long_name: 'Mankweng-A',
            short_name: 'Mankweng-A',
            types: ['political', 'sublocality', 'sublocality_level_1'],
          },
          {
            long_name: 'Capricorn District Municipality',
            short_name: 'Capricorn District Municipality',
            types: ['administrative_area_level_2', 'political'],
          },
          {
            long_name: 'Limpopo',
            short_name: 'LP',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'South Africa',
            short_name: 'ZA',
            types: ['country', 'political'],
          },
          {
            long_name: '0727',
            short_name: '0727',
            types: ['postal_code'],
          },
        ],
        formatted_address: 'Grace Mamabolo St, Mankweng-A, 0727, South Africa',
        geometry: {
          bounds: {
            northeast: { lat: -23.880771, lng: 29.7259067 },
            southwest: { lat: -23.881146, lng: 29.7257757 },
          },
          location: { lat: -23.8809632, lng: 29.7258573 },
          location_type: 'GEOMETRIC_CENTER',
          viewport: {
            northeast: { lat: -23.8796095197085, lng: 29.72719018029149 },
            southwest: { lat: -23.8823074802915, lng: 29.7244922197085 },
          },
        },
        place_id: 'ChIJ27X3BOzIxh4R-EIA57HnOB8',
        types: ['route'],
      },
      {
        address_components: [
          {
            long_name: '4P9G+M9',
            short_name: '4P9G+M9',
            types: ['plus_code'],
          },
          {
            long_name: 'Mankweng',
            short_name: 'Mankweng',
            types: ['locality', 'political'],
          },
          {
            long_name: 'Capricorn District Municipality',
            short_name: 'Capricorn District Municipality',
            types: ['administrative_area_level_2', 'political'],
          },
          {
            long_name: 'Limpopo',
            short_name: 'LP',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'South Africa',
            short_name: 'ZA',
            types: ['country', 'political'],
          },
        ],
        formatted_address: '4P9G+M9 Mankweng, South Africa',
        geometry: {
          bounds: {
            northeast: { lat: -23.88075, lng: 29.726 },
            southwest: { lat: -23.880875, lng: 29.725875 },
          },
          location: { lat: -23.8808, lng: 29.7259 },
          location_type: 'GEOMETRIC_CENTER',
          viewport: {
            northeast: { lat: -23.87946351970849, lng: 29.7272864802915 },
            southwest: { lat: -23.8821614802915, lng: 29.7245885197085 },
          },
        },
        place_id: 'GhIJGlHaG3zhN8ARmSoYldS5PUA',
        plus_code: {
          compound_code: '4P9G+M9 Mankweng, South Africa',
          global_code: '5G8F4P9G+M9',
        },
        types: ['plus_code'],
      },
      {
        address_components: [
          {
            long_name: 'Polokwane Local Municipality',
            short_name: 'Polokwane Local Municipality',
            types: ['administrative_area_level_3', 'political'],
          },
          {
            long_name: 'Capricorn District Municipality',
            short_name: 'Capricorn District Municipality',
            types: ['administrative_area_level_2', 'political'],
          },
          {
            long_name: 'Limpopo',
            short_name: 'LP',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'South Africa',
            short_name: 'ZA',
            types: ['country', 'political'],
          },
        ],
        formatted_address: 'Polokwane Local Municipality, South Africa',
        geometry: {
          bounds: {
            northeast: { lat: -23.6124799, lng: 29.9281801 },
            southwest: { lat: -24.2969099, lng: 29.1200401 },
          },
          location: { lat: -23.8980895, lng: 29.45000049999999 },
          location_type: 'APPROXIMATE',
          viewport: {
            northeast: { lat: -23.6124799, lng: 29.9281801 },
            southwest: { lat: -24.2969099, lng: 29.1200401 },
          },
        },
        place_id: 'ChIJ4fYYQ_C3wB4Rn1wi5ix7uaQ',
        types: ['administrative_area_level_3', 'political'],
      },
      {
        address_components: [
          {
            long_name: 'Capricorn District Municipality',
            short_name: 'Capricorn District Municipality',
            types: ['administrative_area_level_2', 'political'],
          },
          {
            long_name: 'Limpopo',
            short_name: 'LP',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'South Africa',
            short_name: 'ZA',
            types: ['country', 'political'],
          },
        ],
        formatted_address: 'Capricorn District Municipality, South Africa',
        geometry: {
          bounds: {
            northeast: { lat: -22.4472468, lng: 30.36621 },
            southwest: { lat: -24.6406199, lng: 28.0969088 },
          },
          location: { lat: -23.6123286, lng: 29.2320784 },
          location_type: 'APPROXIMATE',
          viewport: {
            northeast: { lat: -22.4472468, lng: 30.36621 },
            southwest: { lat: -24.6406199, lng: 28.0969088 },
          },
        },
        place_id: 'ChIJ2UJSaycYxx4RquxgSmrKcFs',
        types: ['administrative_area_level_2', 'political'],
      },
      {
        address_components: [
          {
            long_name: 'Limpopo',
            short_name: 'LP',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'South Africa',
            short_name: 'ZA',
            types: ['country', 'political'],
          },
        ],
        formatted_address: 'Limpopo, South Africa',
        geometry: {
          bounds: {
            northeast: { lat: -22.1254239, lng: 31.8844628 },
            southwest: { lat: -25.4227899, lng: 26.4075388 },
          },
          location: { lat: -23.4012946, lng: 29.4179324 },
          location_type: 'APPROXIMATE',
          viewport: {
            northeast: { lat: -22.1254239, lng: 31.8844628 },
            southwest: { lat: -25.4227899, lng: 26.4075388 },
          },
        },
        place_id: 'ChIJwTDNNhTJxh4RStzIZh49iWI',
        types: ['administrative_area_level_1', 'political'],
      },
      {
        address_components: [
          {
            long_name: 'South Africa',
            short_name: 'ZA',
            types: ['country', 'political'],
          },
        ],
        formatted_address: 'South Africa',
        geometry: {
          bounds: {
            northeast: { lat: -22.1254239, lng: 38.2216904 },
            southwest: { lat: -47.1313489, lng: 16.2816999 },
          },
          location: { lat: -30.559482, lng: 22.937506 },
          location_type: 'APPROXIMATE',
          viewport: {
            northeast: { lat: -22.1254239, lng: 38.2216904 },
            southwest: { lat: -47.1313489, lng: 16.2816999 },
          },
        },
        place_id: 'ChIJURLu2YmmNBwRoOikHwxjXeg',
        types: ['country', 'political'],
      },
    ]

    const address = getAddressFromData(results)
    assertEquals(address, {
      administrative_area_level_2: 'Capricorn District Municipality',
      administrative_area_level_1: 'Limpopo',
      country: 'South Africa',
      route: 'University Road',
      locality: 'Mankweng',
      postal_code: '0727',
    })
  })
})
