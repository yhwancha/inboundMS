import { Controller, Get, Post, Put, Body } from '@nestjs/common';
import { LocationService } from './location.service';
import { InitializeLocationsDto } from './dto/initialize-locations.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  async getAllLocations() {
    return this.locationService.getAllLocations();
  }

  @Post()
  async initializeLocations(@Body() dto: InitializeLocationsDto) {
    return this.locationService.initializeLocations(dto);
  }

  @Put()
  async updateLocation(@Body() dto: UpdateLocationDto) {
    return this.locationService.updateLocation(dto);
  }
}

